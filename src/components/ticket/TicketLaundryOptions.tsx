
import React from 'react';
import { Check } from 'lucide-react';

interface LaundryOptions {
  separateByColor: boolean;
  delicateDry: boolean;
  stainRemoval: boolean;
  bleach: boolean;
  noFragrance: boolean;
  noDry: boolean;
}

interface TicketLaundryOptionsProps {
  options: LaundryOptions;
}

const TicketLaundryOptions: React.FC<TicketLaundryOptionsProps> = ({ options }) => {
  return (
    <div className="space-y-1">
      <span className="text-sm text-muted-foreground">Opciones de lavado:</span>
      <div className="grid grid-cols-2 gap-y-1 gap-x-2 text-xs mt-1">
        <div className="flex items-center">
          <div className={`w-3 h-3 border ${options.separateByColor ? 'bg-laundry-600 border-laundry-600' : 'border-gray-300'} rounded-sm mr-1.5 flex items-center justify-center`}>
            {options.separateByColor && <Check className="h-2 w-2 text-white" />}
          </div>
          <span>1. Separar por color</span>
        </div>
        
        <div className="flex items-center">
          <div className={`w-3 h-3 border ${options.delicateDry ? 'bg-laundry-600 border-laundry-600' : 'border-gray-300'} rounded-sm mr-1.5 flex items-center justify-center`}>
            {options.delicateDry && <Check className="h-2 w-2 text-white" />}
          </div>
          <span>2. Secar en delicado</span>
        </div>
        
        <div className="flex items-center">
          <div className={`w-3 h-3 border ${options.stainRemoval ? 'bg-laundry-600 border-laundry-600' : 'border-gray-300'} rounded-sm mr-1.5 flex items-center justify-center`}>
            {options.stainRemoval && <Check className="h-2 w-2 text-white" />}
          </div>
          <span>3. Desmanchar</span>
        </div>
        
        <div className="flex items-center">
          <div className={`w-3 h-3 border ${options.bleach ? 'bg-laundry-600 border-laundry-600' : 'border-gray-300'} rounded-sm mr-1.5 flex items-center justify-center`}>
            {options.bleach && <Check className="h-2 w-2 text-white" />}
          </div>
          <span>4. Blanquear</span>
        </div>
        
        <div className="flex items-center">
          <div className={`w-3 h-3 border ${options.noFragrance ? 'bg-laundry-600 border-laundry-600' : 'border-gray-300'} rounded-sm mr-1.5 flex items-center justify-center`}>
            {options.noFragrance && <Check className="h-2 w-2 text-white" />}
          </div>
          <span>5. Sin perfume</span>
        </div>
        
        <div className="flex items-center">
          <div className={`w-3 h-3 border ${options.noDry ? 'bg-laundry-600 border-laundry-600' : 'border-gray-300'} rounded-sm mr-1.5 flex items-center justify-center`}>
            {options.noDry && <Check className="h-2 w-2 text-white" />}
          </div>
          <span>6. No secar</span>
        </div>
      </div>
      
      <div className="h-[1px] w-full bg-gray-200 my-2"></div>
    </div>
  );
};

export default TicketLaundryOptions;
