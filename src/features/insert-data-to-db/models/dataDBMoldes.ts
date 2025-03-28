export interface DataFile {
  nazwa: string;
  zawartosc_ocr: string;
  link_do_pliku: string;
  sharepoint_id: string;
}

export interface Project {
  projectName: string;
  description: string;
  clientName: string;
  industryName: string | undefined;
  dateDescription: string | undefined;
  scaleOfImplementation: string | undefined;
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
