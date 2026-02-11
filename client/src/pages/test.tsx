// import React, { useState, useCallback } from "react";
// import Cropper from "react-easy-crop";
// import * as Dialog from "@radix-ui/react-dialog";
// import { ObjectUploader } from "@/components/ObjectUploader";
// // import { Area } from './types/image-crop';
// // import { getCroppedImg } from './utils/cropImage';

// // // utils/cropImage.ts
// // import { Area } from '../types/image-crop';
// // types/image-crop.ts
// export interface Area {
//   width: number;
//   height: number;
//   x: number;
//   y: number;
// }

// export interface CroppedImageResult {
//   file: Blob;
//   url: string;
// }

// export const getCroppedImg = async (
//   imageSrc: string,
//   pixelCrop: Area
// ): Promise<Blob | null> => {
//   const image = await createImage(imageSrc);
//   const canvas = document.createElement("canvas");
//   const ctx = canvas.getContext("2d");

//   if (!ctx) {
//     return null;
//   }

//   // Set canvas size to the cropped area dimensions
//   canvas.width = pixelCrop.width;
//   canvas.height = pixelCrop.height;

//   ctx.drawImage(
//     image,
//     pixelCrop.x,
//     pixelCrop.y,
//     pixelCrop.width,
//     pixelCrop.height,
//     0,
//     0,
//     pixelCrop.width,
//     pixelCrop.height
//   );

//   return new Promise((resolve) => {
//     canvas.toBlob((blob) => {
//       resolve(blob);
//     }, "image/jpeg");
//   });
// };

// // Helper to load image as HTMLImageElement
// const createImage = (url: string): Promise<File> =>
//   new Promise((resolve, reject) => {
//     const image = new Image();
//     image.addEventListener("load", () => resolve(image));
//     image.addEventListener("error", (error) => reject(error));
//     image.setAttribute("crossOrigin", "anonymous"); // Essential for Vercel/S3 URLs
//     image.src = url;
//   });

// interface BannerCropperProps {
//   imageFile: File;
//   onComplete: (croppedBlob: Blob) => void;
// }

// const something = () => {
//   console.log('something');
// }

// export const BannerCropper: React.FC<BannerCropperProps> = ({
//   imageFile,
//   onComplete,
// }) => {
//   const [crop, setCrop] = useState({ x: 0, y: 0 });
//   const [zoom, setZoom] = useState(1);
//   const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

//   // Convert File to object URL for the cropper
//   const imageSrc = React.useMemo(
//     () => URL.createObjectURL(imageFile),
//     [imageFile]
//   );

//   const onCropComplete = useCallback((_area: Area, areaPixels: Area) => {
//     setCroppedAreaPixels(areaPixels);
//   }, []);

//   const handleSave = async () => {
//     if (croppedAreaPixels) {
//       const blob = await getCroppedImg(imageSrc, croppedAreaPixels);
//       if (blob) onComplete(blob);
//     }
//   };

//   return (
//     <Dialog.Root open={true}>
//       <Dialog.Portal>
//         <Dialog.Overlay className="bg-black/50 fixed inset-0" />
//         <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[500px] bg-white p-6">
//           <div className="relative w-full h-80 bg-gray-200">
//             <Cropper
//               image={imageSrc}
//               crop={crop}
//               zoom={zoom}
//               aspect={16 / 9} // Forced banner ratio
//               onCropChange={setCrop}
//               onZoomChange={setZoom}
//               onCropComplete={onCropComplete}
//             />
//           </div>
//           <div className="mt-4 flex justify-end gap-2">
//             <button
//               onClick={handleSave}
//               className="bg-blue-600 text-white px-4 py-2 rounded"
//             >
//               Crop & Upload
//             </button>
//           </div>
//         </Dialog.Content>
//       </Dialog.Portal>
//     </Dialog.Root>
//   );
// };

// export default async function Test() {
//   return (
//     <>
//       <BannerCropper
//         imageFile={await createImage('https://p19epkr3igkubqmd.public.blob.vercel-storage.com/anjir-B5kNx3IRHuXAy2l17AvQbD0o0BStTk.jpg')}
//         onComplete={something}
//       />
//     </>
//   );
// }
