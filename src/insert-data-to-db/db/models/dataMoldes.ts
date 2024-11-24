export interface DataFile {
  nazwa: string;
  zawartosc_ocr: string;
}
export interface DataClient {
  name: string;
  industry: string;
}

export interface Project {
  projectName: string;
  description: string;
  clientName: string;
  industryName: string;
  businessCase: string;
  referenceDate: string;
  implementationScaleValue: number;
  implementationScaleDescription: string;
}

export interface TechnologyProject {
  projectName: string;
  technologies: string[];
}

export interface DataFileProject {
  fileName: string;
  projectName: string;
}

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
