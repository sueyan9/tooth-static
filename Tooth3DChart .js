import React, { useRef, useEffect } from 'react';
import { GLView } from 'expo-gl';
import { Dimensions } from 'react-native';
import { Renderer } from 'expo-three';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export default function Tooth3DChart({ style, onToothPress }) {
    const modelRef = useRef();

    const onContextCreate = async (gl) => {
        const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;
        const renderer = new Renderer({ gl });
        renderer.setSize(width, height);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);

        // set an initial position
        camera.position.z = 2.5;

        // light
        const light = new THREE.DirectionalLight(0xffffff, 2);
        light.position.set(0, 0, 2).normalize();
        scene.add(light);

        // render 3d model
        const loader = new GLTFLoader();
        loader.load(
            'https://cdn.jsdelivr.net/gh/sueyan9/tooth-static@master/assets/adult_whole_mouth.glb',
            (gltf) => {
                const model = gltf.scene;
                modelRef.current = model;

                // caculate bounding box
                const box = new THREE.Box3().setFromObject(model);
                const size = new THREE.Vector3();
                box.getSize(size);

                // set in middle
                const center = new THREE.Vector3();
                box.getCenter(center);
                model.position.sub(center);

                // responsive
                const maxDim = Math.max(size.x, size.y, size.z);
                const desiredSize = 5; // maxsize
                const scale = desiredSize / maxDim;
                model.scale.setScalar(scale);

                scene.add(model);

                // change the camera location according the distance
                camera.position.z = maxDim * 1.8; // 1.8 larger means far side
            },
            undefined,
            (error) => {
                console.error('Error loading model:', error);
            }
        );

        // animate display
        const animate = () => {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
            gl.endFrameEXP();
        };
        animate();
    };

    return (
        <GLView
            style={style}
            onContextCreate={onContextCreate}
        />
    );
}