import * as THREE from 'https://unpkg.com/three@0.119.1/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.119.1/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.119.1/examples/jsm/loaders/GLTFLoader.js';
import { EffectComposer } from 'https://unpkg.com/three@0.119.1/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://unpkg.com/three@0.119.1/examples/jsm/postprocessing/RenderPass.js';
import { FilmPass } from 'https://unpkg.com/three@0.119.1/examples/jsm/postprocessing/FilmPass.js';
import { BloomPass } from 'https://unpkg.com/three@0.119.1/examples/jsm/postprocessing/BloomPass.js';

let LARGURA_JANELA, ALTURA_JANELA;

let cena, camera, render, carregadorModelos, carregadorTexturas, composer, renderPass, filmPass;

function grid(){
    let points = [];

    for (let z = 0; z < 32; z++) {
        for (let x = 0; x < 32; x++) {
                points.push( new THREE.Vector3( x, 0, z));
                points.push( new THREE.Vector3( x + 1, 0, z));
                points.push( new THREE.Vector3( x + 1, 0, z + 1 ));
                points.push( new THREE.Vector3( x, 0, z + 1 ));
                points.push( new THREE.Vector3( x, 0, z));
        }
        points.push( new THREE.Vector3( 7, 0, z));
        points.push( new THREE.Vector3( 7, 0, z + 1));
    }

    return points;
}

function iniciar(){ 
    cena = new THREE.Scene();
    cena.background = new THREE.Color(232 / 255, 250 / 255, 254 / 255);

    LARGURA_JANELA = window.innerWidth;
    ALTURA_JANELA = window.innerHeight;

    //camera = new THREE.PerspectiveCamera(75, LARGURA_JANELA / ALTURA_JANELA, 0.1, 1000);
    let viewSize = 300;
    let aspectRatio = LARGURA_JANELA / ALTURA_JANELA;
    camera = new THREE.OrthographicCamera( - aspectRatio * viewSize / 150, aspectRatio * viewSize / 150,  viewSize / 150, -viewSize / 150, -1000, 1000);
    camera.position.set( 0, 0, 100 );
    camera.lookAt( 0, 0, 0 );
    
    camera.position.y = 2;
    camera.position.x = 2;
    camera.position.z = 3;

    render = new THREE.WebGLRenderer( { antialias: true } );
    
    render.setSize(LARGURA_JANELA, ALTURA_JANELA);

    render.physicallyCorrectLights = true;
    render.outputEncoding = THREE.sRGBEncoding;
    render.setPixelRatio( window.devicePixelRatio );
    render.toneMapping = THREE.CineonToneMapping;
    render.toneMappingExposure = 2;
    render.shadowMap.enabled = true;
    render.shadowMap.type = THREE.PCFSoftShadowMap;

    document.body.appendChild(render.domElement);

    let controls = new OrbitControls(camera, render.domElement);

    controls.maxPolarAngle = Math.PI / 2.1;
}

function carregarObjetos(){
    let luzAmbiente = new THREE.AmbientLight("#ffffff", 1);
    let luzDirecional = new THREE.DirectionalLight("#ffffff", 3);
    luzDirecional.position.set(0, 1, 1);
    luzDirecional.castShadow = true;
    luzDirecional.shadow.normalBias = .05;
    luzDirecional.shadowCameraVisible = true;
    luzDirecional.shadowDarkness = 0.5;
    luzDirecional.shadow.mapSize.set(20, 20);
    cena.add(luzAmbiente);
    cena.add(luzDirecional);

    composer = new EffectComposer(render);
    renderPass = new RenderPass(cena, camera);
    filmPass = new FilmPass(0.35, .5, 648, 0);
    composer.addPass(renderPass);

    let material = new THREE.LineBasicMaterial( { color: 0x0f0f0f } );
    let geometria = new THREE.BufferGeometry().setFromPoints( grid() );
    
    let grade = new THREE.Line( geometria, material );
    grade.position.x -= 16;
    grade.position.z -= 16;
    //cena.add(grade);

    const plane = new THREE.Mesh( new THREE.PlaneGeometry( 32, 32 ), new THREE.MeshPhongMaterial( {color: "#0c510d", side: THREE.DoubleSide} ) );
    plane.rotation.set(1.58, 0.0, 0.0);
    cena.add( plane );

    carregadorTexturas = new THREE.TextureLoader();
    carregadorModelos = new GLTFLoader();

    carregadorModelos.load( './_resource/quarto/quarto.glb', function ( gltf ) {
        let trailer = gltf.scene;
        trailer.position.y += 0.1;
        trailer.scale.set( 0.5, 0.5, 0.5 );
        cena.add(trailer);
    }, undefined, function ( error ) {
        console.error( error );
    } );

    carregadorModelos.load( './_resource/museu/museu.gltf', function ( gltf ) {
        let museu = gltf.scene;
        museu.position.y += 0.5;
        museu.position.x -= 2;
        museu.position.z += -3;
        museu.scale.set( 0.5, 0.5, 0.5 );
        cena.add(museu);
    }, undefined, function ( error ) {
        console.error( error );
    } );

    carregadorModelos.load( './_resource/ac.glb', function ( gltf ) {
        let arvore = gltf.scene;
        arvore.position.x -= 2;
        arvore.position.z += 2;
        arvore.scale.set( 0.2, 0.2, 0.2 );
        cena.add(arvore);
    }, undefined, function ( error ) {
        console.error( error );
    } );

}

function animar(){
    requestAnimationFrame( animar );
    composer.render();
    controls.update();
    render.render(cena, camera);
}

iniciar();
carregarObjetos();
animar();