/*
 * Copyright 2019 The TensorFlow Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.tensorflow.lite.examples.classification;

import android.graphics.Bitmap;
import android.graphics.Bitmap.Config;
import android.graphics.Canvas;
import android.graphics.Matrix;
import android.graphics.RectF;
import android.graphics.Typeface;
import android.graphics.drawable.BitmapDrawable;
import android.media.ImageReader.OnImageAvailableListener;
import android.os.SystemClock;
import android.util.Log;
import android.util.Size;
import android.util.TypedValue;
import android.widget.ImageView;
import android.widget.Toast;
import java.io.IOException;
import java.util.List;

import org.tensorflow.lite.examples.classification.customview.AutoFitTextureView;
import org.tensorflow.lite.examples.classification.env.BorderedText;
import org.tensorflow.lite.examples.classification.env.ImageUtils;
import org.tensorflow.lite.examples.classification.env.Logger;
import org.tensorflow.lite.examples.classification.tflite.Classifier;
import org.tensorflow.lite.examples.classification.tflite.Classifier.Device;
import org.tensorflow.lite.examples.classification.tflite.Classifier.Model;

public class ClassifierActivity extends CameraActivity implements OnImageAvailableListener {
  private static final Logger LOGGER = new Logger();
  private static final boolean MAINTAIN_ASPECT = true;
  private static final Size DESIRED_PREVIEW_SIZE = new Size(640, 480);
  private static final float TEXT_SIZE_DIP = 10;
  private Bitmap rgbFrameBitmap = null;
  private Bitmap croppedBitmap = null;
  private Bitmap cropCopyBitmap = null;

  private Bitmap resizedBitmap = null;

  private long lastProcessingTimeMs;
  private Integer sensorOrientation;
  private Classifier classifier;
  private Matrix frameToCropTransform;
  private Matrix cropToFrameTransform;
  private BorderedText borderedText;

  @Override
  protected int getLayoutId() {
    return R.layout.camera_connection_fragment;
  }

  @Override
  protected Size getDesiredPreviewFrameSize() {
    return DESIRED_PREVIEW_SIZE;
  }

  @Override
  public void onPreviewSizeChosen(final Size size, final int rotation) {
    final float textSizePx =
        TypedValue.applyDimension(
            TypedValue.COMPLEX_UNIT_DIP, TEXT_SIZE_DIP, getResources().getDisplayMetrics());
    borderedText = new BorderedText(textSizePx);
    borderedText.setTypeface(Typeface.MONOSPACE);

    recreateClassifier(getModel(), getDevice(), getNumThreads());
    if (classifier == null) {
      LOGGER.e("No classifier on preview!");
      return;
    }

    previewWidth = size.getWidth();
    previewHeight = size.getHeight();

    sensorOrientation = rotation - getScreenOrientation();
    LOGGER.i("Camera orientation relative to screen canvas: %d", sensorOrientation);

    LOGGER.i("Initializing at size %dx%d", previewWidth, previewHeight);
    rgbFrameBitmap = Bitmap.createBitmap(previewWidth, previewHeight, Config.ARGB_8888);
    croppedBitmap =
        Bitmap.createBitmap(
            classifier.getImageSizeX(), classifier.getImageSizeY(), Config.ARGB_8888);

    /*cropToFrameTransform = new Matrix();
    final float scale = 4.0f;
    final float scaleY = 2.0f;
    final RectF viewRect = new RectF(0, 0, previewWidth, previewHeight);
    final float centerX = viewRect.centerX();
    final float centerY = viewRect.centerY();
    cropToFrameTransform.postScale(scale * classifier.getImageSizeY()/classifier.getImageSizeX() * (float) previewWidth/previewHeight, scale, centerX, centerY);
    //textureView.setTransform(cropToFrameTransform);*/


    frameToCropTransform =
        ImageUtils.getTransformationMatrix(
            previewWidth,
            previewHeight,
            classifier.getImageSizeX(),
            classifier.getImageSizeY(),
            sensorOrientation,
            MAINTAIN_ASPECT);

    cropToFrameTransform = new Matrix();
    frameToCropTransform.invert(cropToFrameTransform);
  }

  @Override
  protected void processImage() {
    rgbFrameBitmap.setPixels(getRgbBytes(), 0, previewWidth, 0, 0, previewWidth, previewHeight);

    resizedBitmap = Bitmap.createBitmap(rgbFrameBitmap, previewWidth/2, previewHeight/2, 50, 100);

    Matrix matrix = new Matrix();
    matrix.setRotate(90);
    Bitmap rotatedBitmap = Bitmap.createBitmap(resizedBitmap, 0, 0, resizedBitmap.getWidth(), resizedBitmap.getHeight(), matrix, true);


    croppedBitmap = Bitmap.createScaledBitmap(resizedBitmap, 25, 50, true);

    final Bitmap test = Bitmap.createBitmap(rotatedBitmap);


    //Log.e("MyTagGoesHere", "This is my log message at the error level here");


    //final Canvas canvas = new Canvas(croppedBitmap);
    //canvas.drawBitmap(rgbFrameBitmap, frameToCropTransform, null);
    //stripImageView.setImageDrawable(new BitmapDrawable(getResources(), croppedBitmap));

    runInBackground(
        new Runnable() {
          @Override
          public void run() {
            if (classifier != null) {
              final long startTime = SystemClock.uptimeMillis();
              final List<Classifier.Recognition> results = classifier.recognizeImage(croppedBitmap);
              lastProcessingTimeMs = SystemClock.uptimeMillis() - startTime;
              LOGGER.v("Detect: %s", results);
              cropCopyBitmap = Bitmap.createBitmap(croppedBitmap);

              runOnUiThread(
                  new Runnable() {
                    @Override
                    public void run() {
                      showResultsInBottomSheet(results);
                      showFrameInfo(previewWidth + "x" + previewHeight);
                      showCropInfo(cropCopyBitmap.getWidth() + "x" + cropCopyBitmap.getHeight());
                      showCameraResolution("25" + "x" + "50");   // ilent2: fix this
                      showRotationInfo(String.valueOf(sensorOrientation));
                      showInference(lastProcessingTimeMs + "ms");

                      stripImageView.setImageBitmap(test);
                    }
                  });
            }
            readyForNextImage();
          }
        });
  }

  @Override
  protected void onInferenceConfigurationChanged() {
    if (croppedBitmap == null) {
      // Defer creation until we're getting camera frames.
      return;
    }
    final Device device = getDevice();
    final Model model = getModel();
    final int numThreads = getNumThreads();
    runInBackground(() -> recreateClassifier(model, device, numThreads));
  }

  private void recreateClassifier(Model model, Device device, int numThreads) {
    if (classifier != null) {
      LOGGER.d("Closing classifier.");
      classifier.close();
      classifier = null;
    }
    if (device == Device.GPU && false) {
      LOGGER.d("Not creating classifier: GPU doesn't support quantized models.");
      runOnUiThread(
          () -> {
            Toast.makeText(this, "GPU does not yet supported quantized models.", Toast.LENGTH_LONG)
                .show();
          });
      return;
    }
    try {
      LOGGER.d(
          "Creating classifier (model=%s, device=%s, numThreads=%d)", model, device, numThreads);
      classifier = Classifier.create(this, model, device, numThreads);
    } catch (IOException e) {
      LOGGER.e(e, "Failed to create classifier.");
    }
  }
}
