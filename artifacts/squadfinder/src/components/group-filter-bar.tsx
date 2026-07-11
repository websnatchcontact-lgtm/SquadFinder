import { GroupFilters, GroupSortKey, DivisionCode, SpecializationCode, GroupHealth } from "@/types";
import { DIVISION_LIST, SPECIALIZATION_LIST } from "@/constants";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, ArrowUpDown } from "lucide-react";

interface GroupFilterBarProps {
  filters: GroupFilters;
  setFilters: (filters: GroupFilters | ((prev: GroupFilters) => GroupFilters)) => void;
  sortKey: GroupSortKey;
  setSortKey: (key: GroupSortKey) => void;
}

export function GroupFilterBar({ filters, setFilters, sortKey, setSortKey }: GroupFilterBarProps) {
  const toggleFilter = <K extends keyof GroupFilters>(key: K, value: GroupFilters[K]) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key] === value ? undefined : value
    }));
  };

  const toggleBooleanFilter = (key: keyof GroupFilters) => {
    setFilters(prev => ({
      ...prev,
      [key]: !prev[key] ? true : undefined
    }));
  };

  return (
    <div className="flex flex-col gap-4 bg-card border rounded-xl p-4 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center text-sm font-medium text-muted-foreground mr-2">
            <Filter className="w-4 h-4 mr-1" /> Filters:
          </div>
          
          <div className="flex gap-1 border-r pr-3">
            {SPECIALIZATION_LIST.map(spec => (
              <Badge 
                key={spec.code}
                variant={filters.specialization === spec.code ? "default" : "outline"} 
                className="cursor-pointer"
                onClick={() => toggleFilter('specialization', spec.code)}
              >
                {spec.label}
              </Badge>
            ))}
          </div>

          <div className="flex gap-1 border-r pr-3">
            {DIVISION_LIST.map(div => (
              <Badge 
                key={div}
                variant={filters.division === div ? "default" : "outline"} 
                className="cursor-pointer"
                onClick={() => toggleFilter('division', div)}
              >
                Div {div}
              </Badge>
            ))}
          </div>

          <div className="flex gap-1 border-r pr-3">
            {(['healthy', 'pending', 'conflict'] as GroupHealth[]).map(h => (
              <Badge 
                key={h}
                variant={filters.health === h ? "default" : "outline"} 
                className="cursor-pointer capitalize"
                onClick={() => toggleFilter('health', h)}
              >
                {h}
              </Badge>
            ))}
          </div>

          <div className="flex gap-1">
            <Badge 
              variant={filters.hasOpenSeats ? "default" : "outline"} 
              className="cursor-pointer"
              onClick={() => toggleBooleanFilter('hasOpenSeats')}
            >
              Open Seats
            </Badge>
            <Badge 
              variant={filters.hasPendingRequests ? "default" : "outline"} 
              className="cursor-pointer"
              onClick={() => toggleBooleanFilter('hasPendingRequests')}
            >
              Has Requests
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2 min-w-[200px]">
          <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
          <Select value={sortKey} onValueChange={(v) => setSortKey(v as GroupSortKey)}>
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alphabetical">Group Number</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="mostMembers">Most Members</SelectItem>
              <SelectItem value="leastMembers">Least Members</SelectItem>
              <SelectItem value="mostConfirmed">Most Confirmed</SelectItem>
              <SelectItem value="mostRequests">Most Requests</SelectItem>
              <SelectItem value="mostConflicts">Most Conflicts</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
