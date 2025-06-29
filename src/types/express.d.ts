
declare namespace Express {
  export interface Request {
    file?: Multer.File;     
    files?: Multer.File[];    
  }
}