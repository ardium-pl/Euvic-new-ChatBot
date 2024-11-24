export interface DataJson {
  fileName: string;
  ocrText: string;
  customers: Customer[];
}

interface Customer {
  clientName: string;
  projectName: string;
  technologies: Technologies;
  description: string;
  businessCase: string;
  referenceDate: string;
  scaleOfImplementationValue: number;
  scaleOfImplementationDescription: string;
  industry: string;
}

interface Technologies {
  name: string[];
}
