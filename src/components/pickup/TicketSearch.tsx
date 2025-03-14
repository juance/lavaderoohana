
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FileText, Calendar, Phone, Search } from 'lucide-react';

type SearchType = 'ticketNumber' | 'name' | 'phone';

interface TicketSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchType: SearchType;
  handleSearchTypeChange: (type: SearchType) => void;
}

const TicketSearch: React.FC<TicketSearchProps> = ({
  searchTerm,
  setSearchTerm,
  searchType,
  handleSearchTypeChange
}) => {
  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder={
              searchType === 'ticketNumber' 
                ? 'Buscar por número de ticket...' 
                : searchType === 'name'
                  ? 'Buscar por nombre de cliente...'
                  : 'Buscar por teléfono...'
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex">
          <Button
            type="button"
            onClick={() => handleSearchTypeChange('ticketNumber')}
            variant={searchType === 'ticketNumber' ? 'default' : 'outline'}
            className={`flex items-center gap-1 rounded-r-none ${
              searchType === 'ticketNumber' ? 'bg-laundry-600 hover:bg-laundry-700' : ''
            }`}
          >
            <FileText className="h-4 w-4" />
            <span className="hidden md:inline">Ticket</span>
          </Button>
          <Button
            type="button"
            onClick={() => handleSearchTypeChange('name')}
            variant={searchType === 'name' ? 'default' : 'outline'}
            className={`flex items-center gap-1 rounded-none border-x-0 ${
              searchType === 'name' ? 'bg-laundry-600 hover:bg-laundry-700' : ''
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span className="hidden md:inline">Nombre</span>
          </Button>
          <Button
            type="button"
            onClick={() => handleSearchTypeChange('phone')}
            variant={searchType === 'phone' ? 'default' : 'outline'}
            className={`flex items-center gap-1 rounded-l-none ${
              searchType === 'phone' ? 'bg-laundry-600 hover:bg-laundry-700' : ''
            }`}
          >
            <Phone className="h-4 w-4" />
            <span className="hidden md:inline">Teléfono</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TicketSearch;
