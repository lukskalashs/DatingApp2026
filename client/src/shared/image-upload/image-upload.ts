import { Component, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-image-upload',
  imports: [],
  templateUrl: './image-upload.html',
  styleUrl: './image-upload.css',
})
export class ImageUpload {
  protected imageSource = signal<string | ArrayBuffer | null | undefined>(null)
  protected isDragging = false;
  private fileoUpload: File | null = null;
  uploadFile = output<File>();
  loading = input<boolean>(false);

  onDragOver(event: DragEvent){
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }
  OnDragLeave(event: DragEvent){
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }
  OnDrop(event: DragEvent){
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    if(event.dataTransfer?.files.length)
    {
      const file = event.dataTransfer.files[0];
      this.previewImage(file);
      this.fileoUpload = file;
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      this.previewImage(file);
      this.fileoUpload = file;
    }
  }

   onCancel(){
    this.fileoUpload = null;
    this.imageSource.set(null);
   }
   onUploadFile(){
    if(this.fileoUpload){
      this.uploadFile.emit(this.fileoUpload)
    }
   }

  private previewImage(file: File){
    const reader = new FileReader();
    reader.onload = (e) => {
      this.imageSource?.set(e.target?.result)
    }
    reader.readAsDataURL(file);
  }

 


}
