import { TfImageRecognition } from 'react-native-tensorflow';

interface TfResults {
    id: number;
    name: string;
    confidence: number;
}

export const tfImageRecognition = new TfImageRecognition({
  model: require('./assets/squeezenet.pb'),
  labels: require('./assets//TP_1_1.png'),
  imageMean: 0.0, // Optional, defaults to 117
  imageStd: 255.0 // Optional, defaults to 1
});

export async function results(model: TfImageRecognition): Promise<any[]> {
  return await model.recognize({
    image: require('MantisStripTester/ClassificationTests/Images/True_positive/TP_1_1.png'),
    inputName: 'input', //Optional, defaults to "input"
    inputSize: 224, //Optional, defaults to 224
    outputName: 'output', //Optional, defaults to "output"
    maxResults: 1, //Optional, defaults to 3
    threshold: 0.1 //Optional, defaults to 0.1
  });
}
