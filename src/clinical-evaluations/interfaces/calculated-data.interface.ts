/**
 * Interface que documenta la estructura típica del campo calculatedData.
 * Esta interface es opcional y sirve como documentación - el campo real
 * acepta cualquier estructura JSON para máxima flexibilidad.
 */
export interface CalculatedDataStructure {
  // Percentiles (principalmente para niños)
  bmiPercentile?: number;
  weightPercentile?: number;
  heightPercentile?: number;
  
  // Cálculos nutricionales básicos
  idealWeight?: number;
  dailyCalories?: number;
  
  // Macronutrientes recomendados
  macronutrients?: {
    proteins: number; // gramos
    carbohydrates: number; // gramos
    fats: number; // gramos
    fiber?: number; // gramos
  };
  
  // Indicadores específicos por edad
  growthVelocity?: number; // cm/año (para niños)
  nutritionalRisk?: 'low' | 'medium' | 'high';
  
  // Datos específicos para embarazadas
  pregnancyData?: {
    gestationalWeek?: number;
    prePregnancyWeight?: number;
    recommendedWeightGain?: number;
    currentWeightGain?: number;
  };
  
  // Datos específicos para adultos mayores
  elderlyData?: {
    sarcopeniaRisk?: 'low' | 'medium' | 'high';
    frailtyIndex?: number;
    functionalStatus?: string;
  };
  
  // Otros indicadores
  bodyComposition?: {
    fatPercentage?: number;
    muscleMass?: number;
    boneDensity?: number;
  };
  
  // Recomendaciones de seguimiento
  followUp?: {
    nextEvaluationWeeks?: number;
    priorityLevel?: 'low' | 'medium' | 'high';
    specializedReferral?: boolean;
  };
  
  // Campo abierto para datos adicionales específicos del formulario
  formSpecificData?: Record<string, any>;
}