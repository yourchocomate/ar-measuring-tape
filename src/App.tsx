import { Color4, PointerEventTypes, Vector3, HemisphericLight, Scene, WebXRBackgroundRemover, WebXRHitTest, WebXRAnchorSystem, ArcRotateCamera, WebXRState, MeshBuilder, StandardMaterial, Quaternion, Color3 } from '@babylonjs/core';
import * as GUI from '@babylonjs/gui';
import "@babylonjs/loaders/glTF";
import './App.css'
import * as BABYLON from "babylonjs-hook";

function App() {

  // default rendering scale
  const renderScale = 1.0;

  // default hardware scaling level
  const hardwareScalingLevel = 1;

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

    // create a fullscreen UI
    const ui = GUI.AdvancedDynamicTexture.CreateFullscreenUI("defaultUI");

    const textBlock = new GUI.TextBlock();
    textBlock.text = "";
    textBlock.height = `${(200 * renderScale) / hardwareScalingLevel}px`;
    textBlock.color = "white";
    textBlock.fontSize = (32 * renderScale) / hardwareScalingLevel;
    textBlock.verticalAlignment =
      GUI.Control.VERTICAL_ALIGNMENT_TOP;
    textBlock.textHorizontalAlignment =
      GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    textBlock.horizontalAlignment =
      GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    textBlock.top = `${(50 * renderScale) / hardwareScalingLevel}px`;
    textBlock.left = `${(50 * renderScale) / hardwareScalingLevel}px`;
    ui.addControl(textBlock);


    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let xr: any;

    try {
      xr = await scene.createDefaultXRExperienceAsync({
        // ask for an ar-session
        uiOptions: {
          sessionMode: "immersive-ar",
        },
        disableDefaultUI: true
      });
    } catch (e) {
      console.log((e as Error).message)
    }
  
    if(!xr?.baseExperience) {
      console.log("Not Supported")
    }

    const base = xr?.baseExperience;

    const enterAR = GUI.Button.CreateSimpleButton(
      "enterAR",
      "Measure"
    );

    enterAR.width = `${
      (200 * renderScale) / hardwareScalingLevel
    }px`;
    enterAR.height = `${
      (50 * renderScale) / hardwareScalingLevel
    }px`;
    enterAR.color = "white";
    enterAR.fontSize = (28 * renderScale) / hardwareScalingLevel;
    enterAR.background = "#000";
    enterAR.cornerRadius = 5;
    enterAR.isVisible = true;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pairs: any = [];

    const fm = base?.featuresManager;
    fm?.enableFeature(WebXRBackgroundRemover, "latest");
    const hitTest = fm?.enableFeature(WebXRHitTest, "latest");
    const anchorSystem = fm?.enableFeature(WebXRAnchorSystem, "latest");
    // fm?.enableFeature(WebXRPlaneDetector, "latest");

    const dot = MeshBuilder.CreateSphere(
      "dot",
      {
        diameter: 0.05,
      },
      scene
    );
    dot.rotationQuaternion = new Quaternion();

    const mat = new StandardMaterial("dot", scene);
    mat.emissiveColor = Color3.Yellow();

    dot.material = mat;

    dot.isVisible = false;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let lastHitTest: any = null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let currentPair: any = null;

    
    base?.onStateChangedObservable.add((state: number) => {
      switch (state) {
        case WebXRState.ENTERING_XR:
          break;
        case WebXRState.IN_XR:
          enterAR.isVisible = false;
          break;
        case WebXRState.NOT_IN_XR:
          enterAR.isVisible = true;
          break;
        case WebXRState.EXITING_XR:
          // reload th page to clean up
          location.reload();
          break;
        default:
          break;
      }
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    hitTest.onHitTestResultObservable.add((results: any) => {
      if (results.length > 0) {
        dot.isVisible = true;
        results[0].transformationMatrix.decompose(
          dot.scaling,
          dot.rotationQuaternion,
          dot.position
        );
        lastHitTest = results[0];
        if (currentPair) {
          if (currentPair.line) {
            currentPair.line.dispose();
          }
          currentPair.line = MeshBuilder.CreateLines(
            "lines",
            {
              points: [currentPair.startDot.position, dot.position]
            },
            scene
          );
          const dist = Vector3.Distance(
            currentPair.startDot.position,
            dot.position
          );
          const roundDist = Math.round(dist * 100) / 100;
          currentPair.text.text = roundDist + "m";
          textBlock.text =
            "Last Measure:\n" +
            roundDist +
            "m\n" +
            Math.round((roundDist / 0.3048) * 100) / 100 +
            "ft\n" +
            Math.round(roundDist * 39.37 * 100) / 100 +
            "in\n" +
            Math.round(roundDist * 100 * 100) / 100 +
            "cm";
        }
      } else {
        lastHitTest = null;
        dot.isVisible = false;
        textBlock.text = "";
      }
    });

    const processClick = () => {
      const newDot = dot.clone("newDot");
      if (!currentPair) {
        const label = new GUI.Rectangle("label");
        label.background = "black";
        label.height = "60px";
        label.alpha = 0.5;
        label.width = "200px";
        label.cornerRadius = 20;
        label.thickness = 1;
        label.zIndex = 5;
        label.top = -30;
        ui.addControl(label);

        const text = new GUI.TextBlock();
        text.color = "white";
        text.fontSize = "36px";
        label.addControl(text);
        currentPair = {
          startDot: newDot,
          label,
          text,
        };
      } else {
        currentPair.label.linkWithMesh(newDot);
        currentPair.endDot = newDot;
        pairs.push(currentPair);
        currentPair = null;
      }
      return newDot;
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    anchorSystem.onAnchorAddedObservable.add((anchor: any) => {
      anchor.attachedNode = processClick();
    });

    enterAR.onPointerUpObservable.add(async function () {
      await base?.enterXRAsync(
        "immersive-ar",
        "unbounded",
        xr.renderTarget
      );

      scene.onPointerObservable.add(async () => {
        if (lastHitTest) {
          if (lastHitTest.xrHitResult.createAnchor) {
            await anchorSystem.addAnchorPointUsingHitTestResultAsync(
              lastHitTest
            );
          } else {
            processClick();
          }
        }
      }, PointerEventTypes.POINTERDOWN);
    });

    base?.sessionManager.onXRFrameObservable.add(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      pairs.forEach((pair: any) => {
        pair.line.dispose();
        pair.line = MeshBuilder.CreateLines(
          "lines",
          { 
            points: [pair.startDot.position, pair.endDot.position]
          },
          scene
        );
      });
    });

    ui.addControl(enterAR);

    return scene;
  };
  
  /**
   * Will run on every frame render.  We are spinning the box on y-axis.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onRender = async(scene: Scene) => {
    // make background transparent
    scene.clearColor = new Color4(0, 0, 0, 0);
  };

  return (
    <>
      <Baby antialias onSceneReady={onSceneReady} onRender={onRender} style={{
        height: "100%",
        width: "100%",
        outline: "none"
      }} />
    </>
  )
}

export default App
