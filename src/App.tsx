import { ArcRotateCamera, Vector3, HemisphericLight, Scene, SceneLoader, WebXRBackgroundRemover } from '@babylonjs/core';
import "@babylonjs/loaders/glTF";
import './App.css'
import * as BABYLON from "babylonjs-hook";

function App() {

  const Baby = BABYLON.default;
  const engine = BABYLON.useEngine();
  engine?.setHardwareScalingLevel(0.5);

  const onSceneReady = async(scene: Scene) => {

    const canvas = scene.getEngine().getRenderingCanvas();
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

    fm?.enableFeature(WebXRBackgroundRemover);

    // This creates and positions a arc rotate camera
    const camera = new ArcRotateCamera("Camera", 3, 1, 500, Vector3.Zero(), scene);
  
    // This attaches the camera to the canva
    camera.attachControl(canvas, true);
  
    // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
    const light = new HemisphericLight("Hemi", new Vector3(0, 1, 0), scene);

    light.intensity = 0.7;
  
    // Default intensity is 1. Let's dim the light a small amount
    const result = await SceneLoader.ImportMeshAsync(null, "./models/", "Buggy.gltf", scene);
    const buggy = result.meshes[0];
    buggy.scaling = new Vector3(0.2,0.2,0.2);
    camera.setTarget(buggy);
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
