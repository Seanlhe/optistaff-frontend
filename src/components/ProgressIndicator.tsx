import { useState } from 'react';

const ProgressIndicator = () => {
  const [currentStep, setCurrentStep] = useState(1);

  return (
    <div className="w-full max-w-sm mx-auto p-8">
      
      {/* Row of circles with lines  */}
      <div className="flex items-center justify-between">
        
        {/* Step 1 */}
        <button
          onClick={() => setCurrentStep(1)}
          className={`w-5 h-5 rounded-full border-2 transition-colors ${
            currentStep >= 1 ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'
          }`}
        />
        
        {/* Line 1 */}
        <div className={`flex-1 h-0.5 mx-2 transition-colors ${
          currentStep > 1 ? 'bg-blue-600' : 'bg-gray-200'
        }`} />
        
        {/* Step 2 */}
        <button
          onClick={() => setCurrentStep(2)}
          className={`w-5 h-5 rounded-full border-2 transition-colors ${
            currentStep >= 2 ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'
          }`}
        />
        
        {/* Line 2 */}
        <div className={`flex-1 h-0.5 mx-2 transition-colors ${
          currentStep > 2 ? 'bg-blue-600' : 'bg-gray-200'
        }`} />
        
        {/* Step 3 */}
        <button
          onClick={() => setCurrentStep(3)}
          className={`w-5 h-5 rounded-full border-2 transition-colors ${
            currentStep >= 3 ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'
          }`}
        />
      </div>

      {/* Labels */}
      <div className="flex justify-between mt-3">
        <p className={`text-sm font-medium ${currentStep === 1 ? 'text-blue-600' : 'text-gray-500'}`}>
          Preferences
        </p>
        <p className={`text-sm font-medium ${currentStep === 2 ? 'text-blue-600' : 'text-gray-500'}`}>
          Availability
        </p>
        <p className={`text-sm font-medium ${currentStep === 3 ? 'text-blue-600' : 'text-gray-500'}`}>
          Submit
        </p>
      </div>
      
    </div>
  );
};

export default ProgressIndicator;