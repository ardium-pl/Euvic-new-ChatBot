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
  businessCase: BusinessCases;
  dateDescription: string;
  scaleOfImplementation: string;
  industry: string;
}

interface Technologies {
  name: string[];
}

interface BusinessCases {
  name: string[];
}
