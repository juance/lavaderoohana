
import React from 'react';
import { Users } from 'lucide-react';
import ChartCard from './ChartCard';

interface FrequentClientsCardProps {
  frequentClients: Array<{
    phone: string;
    name: string;
    visits: number;
  }>;
}

const FrequentClientsCard: React.FC<FrequentClientsCardProps> = ({ frequentClients }) => {
  return (
    <ChartCard 
      title="Frequent Clients" 
      subtitle="Clients with most visits"
    >
      {frequentClients.length > 0 ? (
        <div className="space-y-3">
          {frequentClients.map((client, index) => (
            <div key={index} className="flex justify-between items-center border-b pb-2">
              <div className="flex items-center">
                <Users className="h-4 w-4 text-gray-500 mr-2" />
                <span>{client.name}</span>
              </div>
              <div className="text-sm font-medium">
                {client.visits} {client.visits === 1 ? 'visit' : 'visits'}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-6 text-center text-gray-500">
          No client visit data available
        </div>
      )}
    </ChartCard>
  );
};

export default FrequentClientsCard;
