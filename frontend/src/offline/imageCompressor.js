/**
 * Comprime fotografías capturadas por el operario utilizando la Canvas API del navegador.
 * Reduce el peso en un ~80-90% para optimizar memoria en celulares de gama baja/media
 * y acelerar la posterior sincronización por red móvil.
 *
 * @param {File} file - Archivo original capturado desde la cámara
 * @param {number} [maxWidth=1280] - Ancho máximo permitido
 * @param {number} [quality=0.7] - Factor de compresión JPEG (0.1 a 1.0)
 * @returns {Promise<{ blob: Blob, dataUrl: string, originalSize: number, compressedSize: number }>}
 */
export const compressImage = (file, maxWidth = 1280, quality = 0.7) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Mantener relación de aspecto redimensionando si supera el ancho máximo
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return reject(new Error('Error al comprimir la fotografía en el canvas'));
            }

            const dataUrl = canvas.toDataURL('image/jpeg', quality);
            resolve({
              blob,
              dataUrl,
              originalSize: file.size,
              compressedSize: blob.size
            });
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = (err) => reject(new Error('No fue posible decodificar la imagen: ' + err.message));
    };

    reader.onerror = (err) => reject(new Error('Fallo en lectura de archivo: ' + err.message));
  });
};

