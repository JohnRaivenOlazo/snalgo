import React, { useState, useEffect } from "react";
import { InventoryProps, InventoryItem, CollectibleType } from "@/components/game/utils/types";
import PixelatedContainer from "../ui/PixelatedContainer";
import PixelButton from '../ui/PixelButton';
import { ArrowUpDown, Search, ChevronDown, Coins, Diamond, Star, Zap, Package } from "lucide-react";
import { bubbleSort, linearSearch, SearchStep, SortStep } from "@/components/game/utils/algorithms";

const Inventory: React.FC<InventoryProps> = ({
  items,
  capacity,
  currentWeight,
  onDeleteItem,
  onCapacityChange
}) => {
  
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [sortSteps, setSortSteps] = useState<SortStep<InventoryItem>[]>([]);
  const [currentSortStep, setCurrentSortStep] = useState<number>(-1);
  const [searchSteps, setSearchSteps] = useState<SearchStep<InventoryItem>[]>([]);
  const [currentSearchStep, setCurrentSearchStep] = useState<number>(-1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortedItems, setSortedItems] = useState<InventoryItem[]>(items);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>(items);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  useEffect(() => {
    setSortedItems(items);
    setFilteredItems(items);
  }, [items]);

  const getCollectibleIcon = (type: CollectibleType) => {
    switch (type) {
      case CollectibleType.COIN:
        return <Coins className="text-yellow-500 drop-shadow-md" size={16} />;
      case CollectibleType.GEM:
        return <Diamond className="text-blue-500 drop-shadow-md" size={16} />;
      case CollectibleType.POTION:
        return <Zap className="text-purple-500 drop-shadow-md" size={16} />;
      case CollectibleType.ARTIFACT:
        return <Star className="text-orange-500 drop-shadow-md" size={16} />;
      default:
        return <Coins className="text-yellow-500 drop-shadow-md" size={16} />;
    }
  };

  const handleSort = (sortBy: 'value' | 'weight' | 'type' | 'timestamp') => {
    if (sortBy === sortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortOrder('asc');
    }
    setSearchSteps([]);
    setCurrentSearchStep(-1);
    setSearchTerm('');
    setIsSearching(false);
    setFilteredItems(sortedItems);
    
    const compareFn = (a: InventoryItem, b: InventoryItem) => {
      if (sortOrder === 'asc') {
        return a[sortBy] > b[sortBy] ? 1 : -1;
      } else {
        return a[sortBy] < b[sortBy] ? 1 : -1;
      }
    };
    
    if (items.length <= 1) {
      return;
    }
    
    const steps = bubbleSort<InventoryItem>(items, compareFn);
    setSortSteps(steps);
    setCurrentSortStep(0);
    
    let step = 0;
    const interval = setInterval(() => {
      if (step < steps.length) {
        setCurrentSortStep(step);
        step++;
      } else {
        clearInterval(interval);
        setSortedItems(steps[steps.length - 1].array);
        setFilteredItems(steps[steps.length - 1].array);
        setTimeout(() => {
          setCurrentSortStep(-1);
        }, 1000);
      }
    }, 300);
  };

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setFilteredItems(sortedItems);
      return;
    }
    
    setSortSteps([]);
    setCurrentSearchStep(-1);
    setIsSearching(true);
    
    const predicate = (item: InventoryItem) => item.type.toLowerCase().includes(searchTerm.toLowerCase());
    const steps = linearSearch<InventoryItem>(sortedItems, predicate);
    setSearchSteps(steps);
    
    if (steps.length === 0) {
      return;
    }
    
    setCurrentSearchStep(0);
    
    let step = 0;
    const interval = setInterval(() => {
      if (step < steps.length) {
        setCurrentSearchStep(step);
        step++;
      } else {
        clearInterval(interval);
        const matchedItems = sortedItems.filter(predicate);
        setFilteredItems(matchedItems);
        
        setTimeout(() => {
          setCurrentSearchStep(-1);
          setIsSearching(false);
        }, 1000);
      }
    }, 300);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchSteps([]);
    setCurrentSearchStep(-1);
    setIsSearching(false);
    setFilteredItems(sortedItems);
  };

  const handleCapacityUpgrade = () => {
    if (onCapacityChange) {
      const newCapacity = capacity + 10;
      onCapacityChange(newCapacity);
    }
  };

  const displayItems = currentSortStep >= 0 && sortSteps.length > 0
    ? sortSteps[currentSortStep].array 
    : currentSearchStep >= 0 && searchSteps.length > 0 
      ? searchSteps[currentSearchStep].array 
      : filteredItems;

  return (
    <PixelatedContainer 
      className="w-full h-full flex flex-col gap-4 mt-4 md:mt-0 relative overflow-hidden"
      glowEffect={true}
      variant="elevated"
    >
      <div className="flex items-center justify-between border-b border-game-border pb-2">
        <div className="flex items-center gap-2">
          <Package size={14} className="text-primary animate-pulse" />
          <h3 className="font-pixel text-xs md:text-sm text-white">Collectibles</h3>
        </div>
        <div className="text-xs font-pixel text-white relative">
          <span className="animate-pulse-glow px-1.5 py-0.5 rounded">
            {currentWeight}/{capacity}
          </span>
        </div>
      </div>
      
        <div className="mt-4 flex items-center gap-2">
          <span className="text-[10px] font-pixel text-white">Upgrade Capacity</span>
          <PixelButton 
            variant="secondary" 
            size="sm"
            onClick={handleCapacityUpgrade}
            className="px-2 py-1 flex rounded-full bg-green-500 items-center gap-1 hover:bg-green-500/80 hover:animate-pulse"
          >
            <span className="text-[10px]">+10</span>
            <span className="text-[10px] text-white">for</span>
            <Coins size={10} className="ml-1 text-yellow-500" />
            <span className="text-[10px]">10</span>
          </PixelButton>
        </div>

      
      <div className="flex flex-wrap gap-2 mt-2">
        <div className="relative">
          <PixelButton 
            variant="secondary" 
            size="sm" 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1 hover:animate-pulse"
          >
            <ArrowUpDown size={12} />
            <span className="text-[10px]">Sort</span>
            <ChevronDown size={12} />
          </PixelButton>
          {isDropdownOpen && (
            <div className="absolute mt-1 w-32 bg-background border border-game-border z-10 animate-fade-in">
              <div 
                className="p-2 text-[8px] font-pixel text-white cursor-pointer hover:bg-muted transition-colors"
                onClick={() => handleSort('value')}
              >
                Sort by Value
              </div>
              <div 
                className="p-2 text-[8px] font-pixel text-white cursor-pointer hover:bg-muted transition-colors"
                onClick={() => handleSort('weight')}
              >
                Sort by Weight
              </div>
              <div 
                className="p-2 text-[8px] font-pixel text-white cursor-pointer hover:bg-muted transition-colors"
                onClick={() => handleSort('type')}
              >
                Sort by Type
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <input 
            type="text" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            placeholder="Search..." 
            className="text-[10px] font-pixel p-1 border border-game-border bg-background text-white focus:border-primary focus:outline-hidden transition-colors"
          />
          <PixelButton 
            variant="primary" 
            size="sm"
            onClick={handleSearch}
            className="flex items-center gap-1 hover:animate-pulse"
          >
            <Search size={12} />
          </PixelButton>
          {searchTerm && (
            <PixelButton 
              variant="secondary" 
              size="sm"
              onClick={handleClearSearch}
              className="flex items-center hover:animate-pulse"
            >
              <span className="text-[10px]">Clear</span>
            </PixelButton>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto mt-2 relative">
        {displayItems.length === 0 ? (
          <div className="text-center text-muted-foreground text-xs font-pixel py-4">
            {isSearching ? "Searching..." : searchTerm ? "No matching collectibles found" : "No collectibles found"}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {displayItems.map((item, index) => {
              const isHighlighted = 
                (currentSortStep !== -1 && sortSteps.length > 0 && 
                 (index === sortSteps[currentSortStep].comparedIndices[0] || 
                  index === sortSteps[currentSortStep].comparedIndices[1]));
              
              const isCurrentlySearched = 
                currentSearchStep !== -1 && 
                searchSteps.length > 0 && 
                index === searchSteps[currentSearchStep].currentIndex;
                
              const isFound = 
                currentSearchStep !== -1 && 
                searchSteps.length > 0 && 
                searchSteps[currentSearchStep].foundIndices.includes(index);

              return (
                <div
                  key={item.id}
                  className={`
                    flex items-center justify-between p-2 text-xs
                    ${isHighlighted || isCurrentlySearched ? 'bg-muted' : 'bg-background'}
                    ${isFound ? 'border-2 border-green-500 neon-border' : 'border border-game-border'}
                    ${isHighlighted || isCurrentlySearched ? 'animate-pulse' : ''}
                    transition-all duration-300 hover:bg-muted/50 group
                  `}
                >
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      {getCollectibleIcon(item.type as CollectibleType)}
                      <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-white rounded-full opacity-0 group-hover:opacity-50 transition-opacity"></div>
                    </div>
                    <span className="font-pixel text-[10px] group-hover:text-primary transition-colors">{item.type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-muted-foreground">Val:</span>
                      <span className="text-[10px]">{item.value}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-muted-foreground">Wt:</span>
                      <span className="text-[10px]">{item.weight}</span>
                    </div>
                    {onDeleteItem && (
                      <PixelButton 
                        variant="secondary" 
                        size="sm"
                        onClick={() => onDeleteItem(item.id)}
                        className="p-1 ml-1 flex items-center group-hover:animate-pulse"
                        title="Sell for coins"
                      >
                        <Coins size={10} className="text-yellow-500" />
                        <span className="text-[8px] ml-1">{item.sellValue}</span>
                      </PixelButton>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-3/4 opacity-20 animate-float">
            <Diamond size={8} className="text-blue-400" />
          </div>
          <div className="absolute top-3/4 left-1/4 opacity-20 animate-bounce-subtle">
            <Coins size={8} className="text-yellow-400" />
          </div>
        </div>
      </div>
      
      <div className="w-full h-2 bg-muted mt-2 relative overflow-hidden rounded-full">
        <div
          className="h-full bg-linear-to-r from-primary/70 to-primary transition-all duration-300"
          style={{ width: `${(currentWeight / capacity) * 100}%` }}
        />
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCAwaDQwdjRIMHoiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiIGZpbGwtcnVsZT0iZXZlbm9kZCIvPjwvc3ZnPg==')]"></div>
      </div>
    </PixelatedContainer>
  );
};

export default Inventory;
