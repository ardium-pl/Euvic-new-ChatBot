export interface DataFile {
  nazwa: string;
  zawartosc_ocr: string;
  link_do_pliku: string;
  sharepoint_id: string;
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
  dateDescription: string;
  scaleOfImplementation: string;
}

export interface TechnologyProject {
  projectName: string;
  technologies: string[];
}

export interface BusinessCasesProject {
  projectName: string;
  businessCases: string[];
}

export interface DataFileProject {
  fileName: string;
  projectName: string;
}

export interface ExistingRow {
  id: number;
}
