import { Injectable } from '@nestjs/common';
import { UploadApiResponse } from 'cloudinary';
import toStream from 'buffer-to-stream'
import { extractCloudinaryPublicId } from 'src/helpers/extract.cloudinary-url';
import cloudinary from 'src/config/cloudinary.config';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  /**
   * Upload a file to Cloudinary.
   * @param file - The file to upload.
   * @param folder - The folder to upload the file to.
   * @param resourceType - The type of resource (e.g., 'image', 'raw', 'video', 'audio').
   * @returns Promise<UploadApiResponse | UploadApiErrorResponse>
   */

  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'uploads',
    resourceType: 'image' | 'auto' = 'auto'
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: resourceType,
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('No result returned from Cloudinary'));
          resolve(result);
        },
      );

      toStream(file.buffer).pipe(uploadStream);
    });
  }


  

  /** 
   * Delete a file from Cloudinary using its public ID.
   * @param publicId - The public ID of the file to delete.
   * @param resourceType - The type of resource (e.g., 'image', 'raw', 'video').
   * @returns Promise<any>
   */
  async deleteFile(
    publicId: string,
    resourceType: 'image' | 'raw' | 'video' = 'image'
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(
        publicId,
        { resource_type: resourceType },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result); 
          }
        }
      );
    });
  }


   async uploadMultipleImages(
    files: Express.Multer.File[],
    folder: any,
    processSequentially?: boolean
  ) {
    try {
  
      if (!files || files.length === 0) {
        throw new Error("No files provided for upload");
      }

      const uploadResults: Array<{
        originalname: string;
        mimetype: string;
        size: number;
        cloudinaryResult: UploadApiResponse;
        secure_url: string;
        public_id: string;
        path: string;
      }> = [];

      if (processSequentially) {
        // Process files sequentially to avoid memory issues
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          console.log(
            `Processing image ${i + 1}/${files.length}: ${file.originalname}`
          );

          try {
            const uploadResult = await this.uploadFile(file, folder, 'image');

            uploadResults.push({
              originalname: file.originalname,
              mimetype: file.mimetype,
              size: file.size,
              cloudinaryResult: uploadResult,
              secure_url: uploadResult.secure_url,
              public_id: uploadResult.public_id,
              path: uploadResult.secure_url,
            });

            console.log(
              `Successfully processed image ${i + 1}: ${uploadResult.public_id}`
            );
          } catch (fileError) {
            console.error(
              `Error processing file ${file.originalname}:`,
              fileError
            );
            throw new Error(`Failed to process image: ${file.originalname}`);
          }
        }
      } else {
        // Process files in parallel
        const uploadPromises = files.map(async (file, index) => {
          console.log(
            `Processing image ${index + 1}/${files.length}: ${file.originalname}`
          );

          const uploadResult = await this.uploadFile(file, folder, 'image');

          return {
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            cloudinaryResult: uploadResult,
            secure_url: uploadResult.secure_url,
            public_id: uploadResult.public_id,
            path: uploadResult.secure_url,
          };
        });

        const uploadResults = await Promise.all(uploadPromises);
        return uploadResults;
      }
    } catch (error) {
      console.error("Error uploading multiple images:", error);
      throw new Error("Failed to upload multiple images");
    }
  }



  /**
   * Extract the public ID from a Cloudinary URL.
   * @param url - The Cloudinary URL.
   * @returns string - The public ID.
   */
  extractPublicId(url: string): string {
    return extractCloudinaryPublicId(url);
  }


 async deleteImageFromUrl(imageUrl, folder = null) {
    try {
      if (!imageUrl || !imageUrl.includes("cloudinary.com")) {
        throw new Error("Invalid Cloudinary URL provided");
      }

      // Extract public ID from URL
      let publicId;
      if (folder) {
        // If folder is provided, include it in the public ID
        const urlParts = imageUrl.split("/");
        const folderIndex = urlParts.findIndex((part) => part === folder);
        if (folderIndex !== -1 && folderIndex < urlParts.length - 1) {
          const fileName = urlParts[urlParts.length - 1];
          const fileNameWithoutExtension = fileName.split(".")[0];
          publicId = `${folder}/${fileNameWithoutExtension}`;
        }
      }

      if (!publicId) {
        // Fallback method
        const urlParts = imageUrl.split("/");
        const fileName = urlParts[urlParts.length - 1];
        publicId = fileName.split(".")[0];
      }

      return await this.deleteFile(publicId);
    } catch (error) {
      console.error("Error deleting image from URL:", error);
      throw new Error(`Failed to delete image from URL: ${error.message}`);
    }
  }

  
 /**
   * Delete multiple images
   * @param {Array} publicIds - Array of public IDs or URLs
   * @param {Object} options - Deletion options
   * @returns {Promise<Array>} Array of deletion results
   */
   async deleteMultipleImages(
    publicIds: string[],
    options: { concurrent?: boolean } = {}
  ) {
    try {
      if (!publicIds || publicIds.length === 0) {
        return [];
      }

      const { concurrent = false } = options;
      const results: PromiseSettledResult<any>[] = [];

      if (concurrent) {
        // Delete in parallel
        const deletePromises = publicIds.map((id) => {
          if (typeof id === "string" && id.includes("cloudinary.com")) {
            return this.deleteFile(id);
          } else {
            return this.deleteFile(id);
          }
        });

        const deleteResults = await Promise.allSettled(deletePromises);
        results.push(...deleteResults);
      } else {
        // Delete sequentially
        for (const id of publicIds) {
          try { 
            let result;  
            if (typeof id === "string" && id.includes("cloudinary.com")) {
              result = await this.deleteImageFromUrl(id);
            } else {
              result = await this.deleteFile(id);
            }
            results.push({ status: "fulfilled", value: result });
          } catch (error) {
            results.push({ status: "rejected", reason: error });
          }
        }
      }

      return results;
    } catch (error) {
      console.error("Error deleting multiple images:", error);
      throw new Error(`Failed to delete multiple images: ${error.message}`);
    }
  }
}