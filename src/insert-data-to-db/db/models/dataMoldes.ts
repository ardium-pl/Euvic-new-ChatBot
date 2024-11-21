export interface DataFile {
  nazwa: string;
  zawartosc_ocr: string;
}

export interface DataClient {
  name: string;
  industry: string;
}

export interface Project {
  clientName: string;
  industryName: string;
  businessCase: string;
  description: string;
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
