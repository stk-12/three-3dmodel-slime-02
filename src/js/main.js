import { radian, lerp } from './utils';
import { SplitText } from './splitText';
import * as THREE from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { gsap } from "gsap";
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"


class Main {
  constructor() {
    this.viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    this.canvas = document.querySelector("#canvas");

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.viewport.width, this.viewport.height);

    this.dracoLoader = new DRACOLoader();
    this.dracoLoader.setDecoderPath('libs/draco/');
    this.loader = new GLTFLoader();
    this.loader.setDRACOLoader(this.dracoLoader);

    this.model = null;
    this.animations = null;
    this.mixer = null;
    this.clock = new THREE.Clock();

    this.scene = new THREE.Scene();
    this.group = new THREE.Group();
    this.groupChild = new THREE.Group();
    this.scene.add(this.group);
    this.group.add(this.groupChild);
    this.camera = null;
    this.mesh = null;

    // this.controls = null;


    this.cursor = {
      x: 0,
      y: 0
    };

    this.stalker = document.querySelector('.js-stalker');
    // マウスストーカーの位置情報を追加
    this.stalkerPos = { x: this.viewport.width / 2, y: this.viewport.height / 2 };

    this.isEnd = false;

    this._init();

    this._addEvent();
  }

  _setCamera() {
    //ウインドウとWebGL座標を一致させる
    const fov = 45;
    const fovRadian = (fov / 2) * (Math.PI / 180); //視野角をラジアンに変換
    const distance = (this.viewport.height / 2) / Math.tan(fovRadian); //ウインドウぴったりのカメラ距離
    this.camera = new THREE.PerspectiveCamera(fov, this.viewport.width / this.viewport.height, 1, distance * 5);
    this.camera.position.z = distance;
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    this.scene.add(this.camera);
  }

  // _setControlls() {
  //   this.controls = new OrbitControls(this.camera, this.canvas);
  //   this.controls.enableDamping = true;
  // }

  _setLight() {
    const light1 = new THREE.DirectionalLight(0xffffff, 0.8);
    light1.position.set(100, 500, 10);
    this.scene.add(light1);
    
    // helper
    const directionalLightHelper = new THREE.DirectionalLightHelper(light1, 50);
    // this.scene.add(directionalLightHelper);

    const light2 = new THREE.DirectionalLight(0xffffff, 0.8);
    light2.position.set(-400, 300, -30);
    this.scene.add(light2);
    
    // helper
    const directionalLightHelper2 = new THREE.DirectionalLightHelper(light2, 50);
    // this.scene.add(directionalLightHelper2);


    const light3 = new THREE.DirectionalLight(0xffffff, 0.8);
    light3.position.set(300, 50, 500);
    this.scene.add(light3);
    
    // helper
    const directionalLightHelper3 = new THREE.DirectionalLightHelper(light3, 50);
    // this.scene.add(directionalLightHelper3);


    const ambLight = new THREE.AmbientLight(0xFFFFFF, 1.1);
    this.scene.add(ambLight);

  }

  _addModel() {
    this.loader.load('model/slime_animation.glb', (gltf) => {
      const model = gltf.scene;

      this.animations = gltf.animations;
      if(this.animations && this.animations.length) {
        //Animation Mixerインスタンスを生成
        this.mixer = new THREE.AnimationMixer(model);

        //全てのAnimation Clipに対して
        for (let i = 0; i < this.animations.length; i++) {
          let animation = this.animations[i];

          //Animation Actionを生成
          let action = this.mixer.clipAction(animation) ;

          //ループ設定
          // action.setLoop(THREE.LoopOnce); // 1回再生
          action.setLoop(THREE.LoopRepeat); // ループ再生

          //アニメーションの最後のフレームでアニメーションが終了
          // action.clampWhenFinished = true;

          //アニメーションを再生
          action.play();
        }
      }

      // model.scale.set(100.0, 100.0, 100.0);
      model.scale.set(this.viewport.width * 0.1, this.viewport.width * 0.1, this.viewport.width * 0.1);

      this.model = model;

      this.model.rotation.y = radian(-103);

      this.groupChild.add(this.model);

      // this.groupChild.scale.set(100, 100, 100);

      this._loadAnimation();

      this._update();
    });
  }

  _initAnimation() {
    this.group.position.y = -this.viewport.height * 0.8;

    const txts = document.querySelectorAll('.js-ttl-txts');
    txts.forEach((txt) => {
      new SplitText(txt);
    });
  }

  _loadAnimation() {

    const tlLoadAnimation = gsap.timeline();

    tlLoadAnimation.to(this.group.position, {
      y: 0,
      duration: 2.0,
      ease: 'power4.out',
    })
    // .to(this.model.rotation, {
    //   y: radian(-463),
    //   duration: 2.0,
    //   ease: 'power4.out',
    // }, '<')
    .to('.js-ttl', {
      opacity: 1,
      duration: 0.1,
    }, '1.4')
    .to('.js-ttl-txts span', {
      y: 0,
      duration: 0.7,
      // ease: 'circ.inOut',
      ease: 'circ.out',
      stagger: 0.08,
    }, '1.4');
  }

  _init() {
    this._initAnimation();

    this._setCamera();

    this._setLight();

    // this._addMesh();

    this._addModel();

  }

  _update(time) {

    let parallaxX = this.cursor.x;
    let parallaxY = this.cursor.y;

    this.group.rotation.x += ((parallaxY * 0.4) - this.group.rotation.x) * 0.08;
    this.group.rotation.y += ((parallaxX * 0.6) - this.group.rotation.y) * 0.08;
    this.group.position.x += ((parallaxX * 6.0) - this.group.position.x) * 0.1;
    this.group.position.y += ((parallaxY * 10.0) - this.group.position.y) * 0.1;

    // マウスストーカー
    this.stalkerPos.x = lerp(this.stalkerPos.x, this.viewport.width * (this.cursor.x + 0.5), 0.2);
    this.stalkerPos.y = lerp(this.stalkerPos.y, this.viewport.height * (this.cursor.y + 0.5), 0.2);

    if (this.stalker) {
      this.stalker.style.transform = `translate(${this.stalkerPos.x}px, ${this.stalkerPos.y}px)`;
    }

    // モデルアニメーション
    if(this.mixer) {
      this.mixer.update(this.clock.getDelta() * 1.5);
    }


    //レンダリング
    this.renderer.render(this.scene, this.camera);
    // this.controls.update();
    requestAnimationFrame(this._update.bind(this));
  }

  _initMouseStalker() {
    this.stalker.classList.add('is-active');
  }

  _onResize() {
    this.viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    }
    // レンダラーのサイズを修正
    this.renderer.setSize(this.viewport.width, this.viewport.height);
    // カメラのアスペクト比を修正
    this.camera.aspect = this.viewport.width / this.viewport.height;
    this.camera.updateProjectionMatrix();
  }

  _onMousemove(e) {
    this.cursor.x = e.clientX / this.viewport.width - 0.5;
    this.cursor.y = e.clientY / this.viewport.height - 0.5;
  }

  _scrollReset() {
    window.scrollTo(0, 0);
  }

  _addEvent() {
    window.addEventListener("resize", this._onResize.bind(this));
    window.addEventListener("beforeunload", this._scrollReset.bind(this));
    window.addEventListener("mousemove", this._onMousemove.bind(this));
    window.addEventListener("mousemove", this._initMouseStalker.bind(this));
  }

}

new Main();



