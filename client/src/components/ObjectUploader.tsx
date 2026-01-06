import { useState } from "react";
import type { ReactNode } from "react";
import Uppy from "@uppy/core";
import type { UploadResult } from "@uppy/core";
import { DashboardModal } from "@uppy/react";
import XHRUpload from "@uppy/xhr-upload";
import ImageEditor from "@uppy/image-editor";
import { Button, buttonVariants } from "@/components/ui/button";
import { VariantProps } from "class-variance-authority";

interface ObjectUploaderProps {
  adType?: string;
  maxNumberOfFiles?: number;
  maxFileSize?: number;
  onGetUploadParameters: (file: any) => Promise<string>;
  onComplete?: (
    result: UploadResult<Record<string, unknown>, Record<string, unknown>>
  ) => void;
  buttonClassName?: string;
  buttonVariant?: any;
  children: ReactNode;
}

/**
 * A file upload component that renders as a button and provides a modal interface for
 * file management.
 *
 * Features:
 * - Renders as a customizable button that opens a file upload modal
 * - Provides a modal interface for:
 *   - File selection
 *   - File preview
 *   - Upload progress tracking
 *   - Upload status display
 *
 * The component uses Uppy under the hood to handle all file upload functionality.
 * All file management features are automatically handled by the Uppy dashboard modal.
 *
 * @param props - Component props
 * @param props.maxNumberOfFiles - Maximum number of files allowed to be uploaded
 *   (default: 1)
 * @param props.maxFileSize - Maximum file size in bytes (default: 10MB)
 * @param props.onGetUploadParameters - Function to get upload parameters (method and URL).
 *   Typically used to fetch a presigned URL from the backend server for direct-to-S3
 *   uploads.
 * @param props.onComplete - Callback function called when upload is complete. Typically
 *   used to make post-upload API calls to update server state and set object ACL
 *   policies.
 * @param props.buttonClassName - Optional CSS class name for the button
 * @param props.children - Content to be rendered inside the button
 */
export function ObjectUploader({
  adType,
  maxNumberOfFiles = 1,
  maxFileSize = 10485760, // 10MB default
  onGetUploadParameters,
  onComplete,
  buttonClassName,
  buttonVariant = "default",
  children,
}: ObjectUploaderProps) {
  const aspectRatioObj = {
    banner: 728 / 90,
    sidebar: 300 / 250,
    inline: 336 / 280,
    popup: 480 / 320,
  };
  const [showModal, setShowModal] = useState(false);
  const [uppy] = useState(() =>
    new Uppy({
      restrictions: {
        maxNumberOfFiles,
        maxFileSize,
      },
      autoProceed: false,
    })
      .use(XHRUpload, {
        formData: false,
        bundle: false,
        withCredentials: true,
        responseType: "json",
        method: "POST",
        endpoint: (fileOrFiles) => {
          const file = Array.isArray(fileOrFiles)
            ? fileOrFiles[0]
            : fileOrFiles;
          return onGetUploadParameters(file);
        },
        headers: (file: any) => ({
          "content-type":
            file?.type || file?.meta?.type || "application/octet-stream",
        }),
      })
      .use(ImageEditor, {
        quality: 0.9,
        cropperOptions: {
          aspectRatio: 300 / 250,
          // aspectRatio: 16 / 9, // Forces the banner ratio
          viewMode: 1, // Restricts crop box to within image boundaries
          autoCropArea: 1, // Makes the crop box cover the whole image initially
          responsive: true,
          guides: true, // Shows the grid lines
          background: false, // Cleaner UI
          modal: true,
          movable: true,
          rotatable: false, // Disable if you don't want users rotating banners
          scalable: false,
          zoomable: true,
        },
      })
      .on("complete", (result) => {
        onComplete?.(result);
      })
  );
  // Listen for the modal closed event
  uppy.on("dashboard:modal-closed", () => {
    console.log("Dashboard modal was closed. Resetting Uppy...");
    uppy.reset(); // This removes all files from the state
  });

  console.log(aspectRatioObj[adType]);

  return (
    <div className="flex justify-center items-center w-full">
      <Button
        onClick={() => setShowModal(true)}
        className={buttonClassName}
        variant={buttonVariant}
        type="button"
      >
        {children}
      </Button>

      <DashboardModal
        uppy={uppy}
        open={showModal}
        onRequestClose={() => setShowModal(false)}
        proudlyDisplayPoweredByUppy={false}
        autoOpen={"imageEditor"}
      />
    </div>
  );
}
