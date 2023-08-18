import { Vector3, HemisphericLight, Scene, SceneLoader, WebXRBackgroundRemover, WebXRHitTest, WebXRAnchorSystem, ArcRotateCamera } from '@babylonjs/core';
import "@babylonjs/loaders/glTF";
import './App.css'
import * as BABYLON from "babylonjs-hook";

function App() {

  const Baby = BABYLON.default;

  const onSceneReady = async(scene: Scene) => {

    // Get the canvas element from the DOM.
    const canvas = scene.getEngine().getRenderingCanvas();

    // This creates and positions a free camera (non-mesh)
    const camera = new ArcRotateCamera("camera", 0, 1.2, 10, Vector3.Zero(), scene);

    // This targets the camera to scene origin
    camera.setTarget(Vector3.Zero());
  
    // This attaches the camera to the canvas
    camera.attachControl(canvas, true);
  
    // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
    const light = new HemisphericLight("Hemi", new Vector3(0, 1, 0), scene);

    // Default intensity is 1. Let's dim the light a small amount
    light.intensity = 0.7;
  
    const result = await SceneLoader.ImportMeshAsync(null, "./models/", "Buggy.gltf", scene);
    const buggy = result.meshes[0];
    buggy.scaling.scaleInPlace(0.03);

    let xr;
    try {
      xr = await scene.createDefaultXRExperienceAsync({
        // ask for an ar-session
        uiOptions: {
          sessionMode: "immersive-ar",
        },
      });
    } catch (e) {
      console.log((e as Error).message)
    }
  
    if(!xr?.baseExperience) {
      console.log("Not Supported")
    }

    const fm = xr?.baseExperience.featuresManager;

    fm?.enableFeature(WebXRBackgroundRemover, "latest");
    fm?.enableFeature(WebXRHitTest, "latest");
    fm?.enableFeature(WebXRAnchorSystem, "latest");
    // fm?.enableFeature(WebXRPlaneDetector, "latest");
  };
  
  /**
   * Will run on every frame render.  We are spinning the box on y-axis.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onRender = async(_scene: Scene) => {
  };

  return (
    <>
      <Baby antialias onSceneReady={onSceneReady} onRender={onRender} style={{
        height: "100%",
        width: "100%"
      }} />
    </>
  )
}

export default App
