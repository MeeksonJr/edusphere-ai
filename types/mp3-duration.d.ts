declare module 'mp3-duration' {
  function mp3Duration(buffer: Buffer | string): Promise<number>;
  function mp3Duration(buffer: Buffer | string, callback: (err: Error | null, duration: number) => void): void;
  export = mp3Duration;
}
