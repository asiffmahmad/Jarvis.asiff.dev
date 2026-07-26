import ffmpeg from 'fluent-ffmpeg';

export const convertAudio = (inputPath: string, outputPath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .output(outputPath)
      .on('end', () => resolve(outputPath))
      .on('error', (err) => reject(err))
      .run();
  });
};
