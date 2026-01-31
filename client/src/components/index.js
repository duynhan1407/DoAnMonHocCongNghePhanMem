export * from './ui';

// Feature exports (keep as-is for now — add more when refactoring per feature)
export { default as NavbarComponent } from './NavbarComponent/NavbarComponent';
export { default as CartComponent } from './CartComponent/CartComponent';
// Backward-compatible alias: UploadComponent -> Upload (from ui)
export { default as UploadComponent } from './ui/Upload/Upload';
