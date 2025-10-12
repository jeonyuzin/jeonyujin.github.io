// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', function() {
        // Three.js 기본 설정
        const roomArea = document.getElementById('canvas-container');
        if (!roomArea) {
            console.error('canvas-container not found');
            return;
        }

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000); // 검은색 배경
        scene.fog = new THREE.Fog(0x000000, 15, 40); // 안개 효과

        // canvas-container 크기 가져오기
        const width = window.innerWidth;
        const height = window.innerHeight;

        const camera = new THREE.PerspectiveCamera(
            45,
            width / height,
            0.1,
            1000
        );

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        renderer.shadowMap.enabled = true;
        roomArea.appendChild(renderer.domElement);

        // 조명 (흰색 조명)
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // 흰색 앰비언트
        ambientLight.userData.isAmbient = true;
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5); // 흰색 디렉셔널
        directionalLight.position.set(10, 20, 10);
        directionalLight.castShadow = true;
        directionalLight.shadow.camera.left = -20;
        directionalLight.shadow.camera.right = 20;
        directionalLight.shadow.camera.top = 20;
        directionalLight.shadow.camera.bottom = -20;
        directionalLight.userData.originalIntensity = 1.5;
        scene.add(directionalLight);

        // 바닥 (검은색)
        const floorSize = 20;
        const floorGroup = new THREE.Group();

        // 사각형 바닥 생성
        const floorGeometry = new THREE.PlaneGeometry(floorSize, floorSize);
        const floorMaterial = new THREE.MeshToonMaterial({
            color: 0x0a0a0a, // 어두운 검은색
            side: THREE.DoubleSide
        });

        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = 0;
        floor.receiveShadow = true;
        floorGroup.add(floor);

        scene.add(floorGroup);

        // 벽 (검은색)
        const wallHeight = 6;
        const wallMaterial = new THREE.MeshToonMaterial({
            color: 0x1a1a1a, // 어두운 회색 (거의 검은색)
            side: THREE.DoubleSide
        });

        // 뒷벽
        const backWallGeometry = new THREE.BoxGeometry(floorSize, wallHeight, 0.2);
        const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
        backWall.position.set(0, wallHeight/2, -floorSize/2);
        backWall.receiveShadow = true;
        backWall.castShadow = true;
        scene.add(backWall);

        // 왼쪽 벽 (전시대 쪽)
        const leftWallGeometry = new THREE.BoxGeometry(0.2, wallHeight, floorSize);
        const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
        leftWall.position.set(-floorSize/2, wallHeight/2, 0);
        leftWall.receiveShadow = true;
        leftWall.castShadow = true;
        scene.add(leftWall);

        // 정면 벽
        const frontWallGeometry = new THREE.BoxGeometry(floorSize, wallHeight, 0.2);
        const frontWall = new THREE.Mesh(frontWallGeometry, wallMaterial);
        frontWall.position.set(0, wallHeight/2, floorSize/2);
        frontWall.receiveShadow = true;
        frontWall.castShadow = true;
        scene.add(frontWall);

        // 천장 (검은색)
        const ceilingHeight = wallHeight;

        const ceilingGeometry = new THREE.PlaneGeometry(floorSize, floorSize);
        const ceilingMaterial = new THREE.MeshToonMaterial({
            color: 0x1a1a1a, // 어두운 회색 (거의 검은색)
            side: THREE.DoubleSide
        });

        const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
        ceiling.rotation.x = Math.PI / 2;
        ceiling.position.y = ceilingHeight;
        ceiling.receiveShadow = true;
        scene.add(ceiling);

        // 천장 매달린 조명 (둥근 전구들)
        const numLights = 12;
        const lightRadius = (floorSize / 2) * 0.7;

        for (let i = 0; i < numLights; i++) {
            const angle = (i / numLights) * Math.PI * 2;
            const x = Math.cos(angle) * lightRadius;
            const z = Math.sin(angle) * lightRadius;

            // 전구 모양 (흰색)
            const bulbGeometry = new THREE.SphereGeometry(0.15, 16, 16);
            const bulbMaterial = new THREE.MeshToonMaterial({
                color: 0xffffff,
                emissive: 0xffffff,
                emissiveIntensity: 0.9
            });
            const bulb = new THREE.Mesh(bulbGeometry, bulbMaterial);
            bulb.position.set(x, ceilingHeight - 0.3, z);
            scene.add(bulb);

            // 전구 포인트 라이트 (흰색)
            const pointLight = new THREE.PointLight(0xffffff, 0.5, 8);
            pointLight.position.set(x, ceilingHeight - 0.5, z);
            pointLight.castShadow = true;
            pointLight.userData.originalIntensity = 0.5;
            scene.add(pointLight);
        }

        // 마인크래프트 스타일 캐릭터 생성
        const character = new THREE.Group();
        character.position.set(3, 0.5, 3); // 서있는 상태로 시작 (테스트용)
        character.rotation.y = Math.PI / 2; // 정면벽 향함
        scene.add(character);

        // 하얀색 캐릭터 재질
        const whiteMaterial = new THREE.MeshToonMaterial({ color: 0xffffff });

        // 상체 그룹 (허리를 기준으로 회전하기 위한 그룹)
        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 0.3; // 허리 위치 (몸통 아래쪽)
        character.add(bodyGroup);

        // 머리 (8x8x8 픽셀 = 0.4x0.4x0.4 유닛)
        const headGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.4);
        const head = new THREE.Mesh(headGeometry, whiteMaterial);
        head.position.y = 0.9; // bodyGroup 기준 (1.2 - 0.3)
        head.castShadow = true;
        bodyGroup.add(head); // bodyGroup의 자식으로 추가

        // 머리 윤곽선
        const headEdges = new THREE.EdgesGeometry(headGeometry);
        const headOutline = new THREE.LineSegments(headEdges, new THREE.LineBasicMaterial({ color: 0x000000 }));
        headOutline.position.set(0, 0, 0); // head의 로컬 좌표 (0,0,0)
        head.add(headOutline); // head의 자식으로 추가

        // 레바 얼굴 그리기 (^ ^)
        const faceCanvas = document.createElement('canvas');
        faceCanvas.width = 64;
        faceCanvas.height = 64;
        const faceCtx = faceCanvas.getContext('2d');
        faceCtx.fillStyle = 'white';
        faceCtx.fillRect(0, 0, 64, 64);

        // 눈 (^ ^)
        faceCtx.fillStyle = 'black';
        faceCtx.font = 'bold 20px Arial';
        faceCtx.fillText('^', 15, 30);
        faceCtx.fillText('^', 40, 30);

        // 입 (작은 미소)
        faceCtx.beginPath();
        faceCtx.arc(32, 35, 8, 0, Math.PI);
        faceCtx.stroke();

        const faceTexture = new THREE.CanvasTexture(faceCanvas);
        faceTexture.magFilter = THREE.NearestFilter;
        faceTexture.minFilter = THREE.NearestFilter;

        const faceMaterial = new THREE.MeshToonMaterial({ map: faceTexture });
        const faceGeometry = new THREE.PlaneGeometry(0.38, 0.38);
        const face = new THREE.Mesh(faceGeometry, faceMaterial);
        face.position.set(0, 0, 0.201); // head의 로컬 좌표 (정면에 붙이기)
        head.add(face); // head의 자식으로 추가

        // 얼굴 참조 저장 (앉을 때 회전시키기 위해)
        character.userData.face = face;

        // 화이트햇 모자 (화이트해커 상징)
        const hatBrimGeometry = new THREE.CylinderGeometry(0.35, 0.35, 0.05, 16);
        const hatBrim = new THREE.Mesh(hatBrimGeometry, whiteMaterial);
        hatBrim.position.y = 1.08; // bodyGroup 기준 (1.38 - 0.3)
        hatBrim.castShadow = true;
        bodyGroup.add(hatBrim); // bodyGroup의 자식으로 추가

        // 모자 챙 윤곽선
        const hatBrimEdges = new THREE.EdgesGeometry(hatBrimGeometry);
        const hatBrimOutline = new THREE.LineSegments(hatBrimEdges, new THREE.LineBasicMaterial({ color: 0x000000 }));
        hatBrimOutline.position.copy(hatBrim.position);
        bodyGroup.add(hatBrimOutline); // bodyGroup의 자식으로 추가

        const hatTopGeometry = new THREE.CylinderGeometry(0.22, 0.22, 0.25, 16);
        const hatTop = new THREE.Mesh(hatTopGeometry, whiteMaterial);
        hatTop.position.y = 1.23; // bodyGroup 기준 (1.53 - 0.3)
        hatTop.castShadow = true;
        bodyGroup.add(hatTop); // bodyGroup의 자식으로 추가

        // 모자 윗부분 윤곽선
        const hatTopEdges = new THREE.EdgesGeometry(hatTopGeometry);
        const hatTopOutline = new THREE.LineSegments(hatTopEdges, new THREE.LineBasicMaterial({ color: 0x000000 }));
        hatTopOutline.position.copy(hatTop.position);
        bodyGroup.add(hatTopOutline); // bodyGroup의 자식으로 추가

        // 몸통 (8x12x4 = 0.4x0.6x0.2)
        const bodyGeometry = new THREE.BoxGeometry(0.4, 0.6, 0.2);
        const body = new THREE.Mesh(bodyGeometry, whiteMaterial);
        body.position.y = 0.3; // bodyGroup 기준 (0.6 - 0.3)
        body.castShadow = true;
        bodyGroup.add(body); // bodyGroup의 자식으로 추가

        // 몸통 윤곽선
        const bodyEdges = new THREE.EdgesGeometry(bodyGeometry);
        const bodyOutline = new THREE.LineSegments(bodyEdges, new THREE.LineBasicMaterial({ color: 0x000000 }));
        bodyOutline.position.set(0, 0, 0); // body의 로컬 좌표 (0,0,0)
        body.add(bodyOutline); // body의 자식으로 추가
        character.userData.bodyOutline = bodyOutline; // 참조 저장

        // 왼팔 그룹
        const leftArmGroup = new THREE.Group();
        leftArmGroup.position.set(-0.3, 0.6, 0); // bodyGroup 기준 (0.9 - 0.3)
        bodyGroup.add(leftArmGroup); // bodyGroup의 자식으로 추가

        const leftArmGeometry = new THREE.BoxGeometry(0.2, 0.6, 0.2);
        const leftArm = new THREE.Mesh(leftArmGeometry, whiteMaterial);
        leftArm.position.y = -0.3;
        leftArm.castShadow = true;
        leftArmGroup.add(leftArm);

        // 왼팔 윤곽선
        const leftArmEdges = new THREE.EdgesGeometry(leftArmGeometry);
        const leftArmOutline = new THREE.LineSegments(leftArmEdges, new THREE.LineBasicMaterial({ color: 0x000000 }));
        leftArmOutline.position.copy(leftArm.position);
        leftArmGroup.add(leftArmOutline);

        // 오른팔 그룹
        const rightArmGroup = new THREE.Group();
        rightArmGroup.position.set(0.3, 0.6, 0); // bodyGroup 기준 (0.9 - 0.3)
        bodyGroup.add(rightArmGroup); // bodyGroup의 자식으로 추가

        const rightArmGeometry = new THREE.BoxGeometry(0.2, 0.6, 0.2);
        const rightArm = new THREE.Mesh(rightArmGeometry, whiteMaterial);
        rightArm.position.y = -0.3;
        rightArm.castShadow = true;
        rightArmGroup.add(rightArm);

        // 오른팔 윤곽선
        const rightArmEdges = new THREE.EdgesGeometry(rightArmGeometry);
        const rightArmOutline = new THREE.LineSegments(rightArmEdges, new THREE.LineBasicMaterial({ color: 0x000000 }));
        rightArmOutline.position.copy(rightArm.position);
        rightArmGroup.add(rightArmOutline);

        // 리모컨 오브젝트 (오른손에 배치)
        const remoteGroup = new THREE.Group();
        remoteGroup.position.set(0, -0.65, 0.15); // 손 위치 (오른팔 끝)
        remoteGroup.visible = false; // 초기에는 숨김
        rightArmGroup.add(remoteGroup);

        // 리모컨 본체
        const remoteBodyGeometry = new THREE.BoxGeometry(0.08, 0.15, 0.04);
        const remoteBodyMaterial = new THREE.MeshToonMaterial({
            color: 0x2a2a4e,
            emissive: 0x0066ff,
            emissiveIntensity: 0.3
        });
        const remoteBody = new THREE.Mesh(remoteBodyGeometry, remoteBodyMaterial);
        remoteBody.castShadow = true;
        remoteGroup.add(remoteBody);

        // 리모컨 윤곽선
        const remoteEdges = new THREE.EdgesGeometry(remoteBodyGeometry);
        const remoteOutline = new THREE.LineSegments(remoteEdges, new THREE.LineBasicMaterial({ color: 0x00ffff }));
        remoteGroup.add(remoteOutline);

        // 리모컨 버튼들 (사이버펑크 스타일)
        const buttonColors = [0xff0066, 0x00ffff, 0xff00ff];
        for (let i = 0; i < 3; i++) {
            const buttonGeometry = new THREE.CircleGeometry(0.015, 8);
            const buttonMaterial = new THREE.MeshToonMaterial({
                color: buttonColors[i],
                emissive: buttonColors[i],
                emissiveIntensity: 0.8
            });
            const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
            button.position.set(0, 0.04 - i * 0.04, 0.021);
            remoteGroup.add(button);
        }

        // 왼다리 그룹 (허벅지 - 고관절 기준)
        const leftLegGroup = new THREE.Group();
        leftLegGroup.position.set(-0.1, 0.3, 0);
        character.add(leftLegGroup);

        // 왼쪽 허벅지
        const leftThighGeometry = new THREE.BoxGeometry(0.2, 0.35, 0.2);
        const leftThigh = new THREE.Mesh(leftThighGeometry, whiteMaterial);
        leftThigh.position.y = -0.175;
        leftThigh.castShadow = true;
        leftLegGroup.add(leftThigh);

        const leftThighEdges = new THREE.EdgesGeometry(leftThighGeometry);
        const leftThighOutline = new THREE.LineSegments(leftThighEdges, new THREE.LineBasicMaterial({ color: 0x000000 }));
        leftThighOutline.position.copy(leftThigh.position);
        leftLegGroup.add(leftThighOutline);

        // 왼쪽 종아리 그룹 (무릎 관절 기준)
        const leftCalfGroup = new THREE.Group();
        leftCalfGroup.position.set(0, -0.35, 0); // 허벅지 끝에 위치
        leftLegGroup.add(leftCalfGroup);

        const leftCalfGeometry = new THREE.BoxGeometry(0.2, 0.35, 0.2);
        const leftCalf = new THREE.Mesh(leftCalfGeometry, whiteMaterial);
        leftCalf.position.y = -0.175;
        leftCalf.castShadow = true;
        leftCalfGroup.add(leftCalf);

        const leftCalfEdges = new THREE.EdgesGeometry(leftCalfGeometry);
        const leftCalfOutline = new THREE.LineSegments(leftCalfEdges, new THREE.LineBasicMaterial({ color: 0x000000 }));
        leftCalfOutline.position.copy(leftCalf.position);
        leftCalfGroup.add(leftCalfOutline);

        // 오른다리 그룹 (허벅지 - 고관절 기준)
        const rightLegGroup = new THREE.Group();
        rightLegGroup.position.set(0.1, 0.3, 0);
        character.add(rightLegGroup);

        // 오른쪽 허벅지
        const rightThighGeometry = new THREE.BoxGeometry(0.2, 0.35, 0.2);
        const rightThigh = new THREE.Mesh(rightThighGeometry, whiteMaterial);
        rightThigh.position.y = -0.175;
        rightThigh.castShadow = true;
        rightLegGroup.add(rightThigh);

        const rightThighEdges = new THREE.EdgesGeometry(rightThighGeometry);
        const rightThighOutline = new THREE.LineSegments(rightThighEdges, new THREE.LineBasicMaterial({ color: 0x000000 }));
        rightThighOutline.position.copy(rightThigh.position);
        rightLegGroup.add(rightThighOutline);

        // 오른쪽 종아리 그룹 (무릎 관절 기준)
        const rightCalfGroup = new THREE.Group();
        rightCalfGroup.position.set(0, -0.35, 0); // 허벅지 끝에 위치
        rightLegGroup.add(rightCalfGroup);

        const rightCalfGeometry = new THREE.BoxGeometry(0.2, 0.35, 0.2);
        const rightCalf = new THREE.Mesh(rightCalfGeometry, whiteMaterial);
        rightCalf.position.y = -0.175;
        rightCalf.castShadow = true;
        rightCalfGroup.add(rightCalf);

        const rightCalfEdges = new THREE.EdgesGeometry(rightCalfGeometry);
        const rightCalfOutline = new THREE.LineSegments(rightCalfEdges, new THREE.LineBasicMaterial({ color: 0x000000 }));
        rightCalfOutline.position.copy(rightCalf.position);
        rightCalfGroup.add(rightCalfOutline);

        // 애니메이션을 위한 팔다리 참조 저장
        character.userData.limbs = {
            leftArm: leftArmGroup,
            rightArm: rightArmGroup,
            leftLeg: leftLegGroup,
            rightLeg: rightLegGroup,
            leftForearm: null, // 팔은 단일 파츠
            rightForearm: null,
            leftCalf: leftCalfGroup, // 종아리 관절 추가
            rightCalf: rightCalfGroup
        };

        // 초기 서있는 자세 설정 (테스트용)
        leftLegGroup.rotation.x = 0;
        leftLegGroup.rotation.z = 0;
        leftCalfGroup.rotation.x = 0;

        rightLegGroup.rotation.x = 0;
        rightLegGroup.rotation.z = 0;
        rightCalfGroup.rotation.x = 0;

        // 팔 자세 (편안하게)
        leftArmGroup.rotation.x = 0;
        rightArmGroup.rotation.x = 0;

        // 얼굴은 정면 유지 (초기에도 정면 바라보기)

        // 오브젝트들 생성
        const objects = [];

        function createObject(x, z, color, name, content) {
            const geometry = new THREE.BoxGeometry(0.8, 1.2, 0.8);
            const material = new THREE.MeshToonMaterial({ color: color }); // 카툰 스타일
            const obj = new THREE.Mesh(geometry, material);
            obj.position.set(x, 0.6, z);
            obj.castShadow = true;
            obj.userData = { name: name, content: content };
            scene.add(obj);
            objects.push(obj);
            return obj;
        }


        // === 업무용 책상 세트 ===
        function createWorkDesk() {
            const group = new THREE.Group();

            // 책상 상판 (높이 상승)
            const deskTopGeometry = new THREE.BoxGeometry(3, 0.1, 1.5);
            const deskMaterial = new THREE.MeshToonMaterial({
                color: 0x8b7355,
                emissive: 0x3d2f1f,
                emissiveIntensity: 0.1
            });
            const deskTop = new THREE.Mesh(deskTopGeometry, deskMaterial);
            deskTop.position.y = 0.9;
            group.add(deskTop);

            // 책상 다리 4개 (높이 증가)
            const legGeometry = new THREE.BoxGeometry(0.1, 0.9, 0.1);
            const legMaterial = new THREE.MeshToonMaterial({ color: 0x654321 });

            const leg1 = new THREE.Mesh(legGeometry, legMaterial);
            leg1.position.set(-1.4, 0.45, -0.6);
            group.add(leg1);

            const leg2 = new THREE.Mesh(legGeometry, legMaterial);
            leg2.position.set(1.4, 0.45, -0.6);
            group.add(leg2);

            const leg3 = new THREE.Mesh(legGeometry, legMaterial);
            leg3.position.set(-1.4, 0.45, 0.6);
            group.add(leg3);

            const leg4 = new THREE.Mesh(legGeometry, legMaterial);
            leg4.position.set(1.4, 0.45, 0.6);
            group.add(leg4);

            const screenMaterial = new THREE.MeshToonMaterial({
                color: 0x0a0a0a,
                emissive: 0x00ff00,
                emissiveIntensity: 0.4
            });
            const standMaterial = new THREE.MeshToonMaterial({ color: 0x333333 });
            const bezelMaterial = new THREE.MeshToonMaterial({ color: 0x1a1a1a });

            // 노트북 (왼쪽, 45도 틀어서 중앙 향함)
            const laptopGroup = new THREE.Group();
            const laptopBaseGeometry = new THREE.BoxGeometry(0.6, 0.02, 0.4);
            const laptopMaterial = new THREE.MeshToonMaterial({ color: 0x2a2a2a });
            const laptopBase = new THREE.Mesh(laptopBaseGeometry, laptopMaterial);
            laptopBase.position.set(0, 0, 0);
            laptopGroup.add(laptopBase);

            const laptopScreenGeometry = new THREE.BoxGeometry(0.6, 0.4, 0.02);
            const laptopScreen = new THREE.Mesh(laptopScreenGeometry, screenMaterial);
            laptopScreen.position.set(0, 0.2, -0.2);
            laptopScreen.rotation.x = -Math.PI / 6;
            laptopGroup.add(laptopScreen);

            laptopGroup.position.set(-0.9, 0.96, 0.2);
            laptopGroup.rotation.y = Math.PI / 4; // 45도 중앙 향함
            group.add(laptopGroup);

            // 모니터 (중앙)
            const monitorStandGeometry = new THREE.CylinderGeometry(0.05, 0.08, 0.3, 8);
            const centerStand = new THREE.Mesh(monitorStandGeometry, standMaterial);
            centerStand.position.set(0, 1.05, 0);
            group.add(centerStand);

            const centerMonitorGeometry = new THREE.BoxGeometry(0.9, 0.55, 0.05);
            const centerMonitor = new THREE.Mesh(centerMonitorGeometry, screenMaterial);
            centerMonitor.position.set(0, 1.5, 0);
            group.add(centerMonitor);

            const centerBezelGeometry = new THREE.BoxGeometry(0.95, 0.6, 0.03);
            const centerBezel = new THREE.Mesh(centerBezelGeometry, bezelMaterial);
            centerBezel.position.set(0, 1.5, -0.02);
            group.add(centerBezel);

            // 모니터 (오른쪽, 45도 틀어서 중앙 향함)
            const rightMonitorGroup = new THREE.Group();
            const rightStand = new THREE.Mesh(monitorStandGeometry, standMaterial);
            rightStand.position.set(0, 0.15, 0);
            rightMonitorGroup.add(rightStand);

            const rightMonitor = new THREE.Mesh(centerMonitorGeometry, screenMaterial);
            rightMonitor.position.set(0, 0.6, 0);
            rightMonitorGroup.add(rightMonitor);

            const rightBezel = new THREE.Mesh(centerBezelGeometry, bezelMaterial);
            rightBezel.position.set(0, 0.6, -0.02);
            rightMonitorGroup.add(rightBezel);

            rightMonitorGroup.position.set(0.9, 0.9, 0);
            rightMonitorGroup.rotation.y = -Math.PI / 4; // 45도 중앙 향함
            group.add(rightMonitorGroup);

            // 키보드 (중앙 모니터 앞)
            const keyboardGeometry = new THREE.BoxGeometry(0.6, 0.03, 0.2);
            const keyboardMaterial = new THREE.MeshToonMaterial({ color: 0x2a2a2a });
            const keyboard = new THREE.Mesh(keyboardGeometry, keyboardMaterial);
            keyboard.position.set(0, 0.96, 0.4);
            group.add(keyboard);

            // 의자 (사각 나무 의자)
            const chairWoodMaterial = new THREE.MeshToonMaterial({ color: 0x8b7355 });

            // 의자 좌석
            const chairSeatGeometry = new THREE.BoxGeometry(0.5, 0.05, 0.5);
            const chairSeat = new THREE.Mesh(chairSeatGeometry, chairWoodMaterial);
            chairSeat.position.set(0, 0.5, 1.3);
            group.add(chairSeat);

            // 의자 다리 4개
            const chairLegGeometry = new THREE.BoxGeometry(0.05, 0.5, 0.05);

            const chairLeg1 = new THREE.Mesh(chairLegGeometry, chairWoodMaterial);
            chairLeg1.position.set(-0.2, 0.25, 1.1);
            group.add(chairLeg1);

            const chairLeg2 = new THREE.Mesh(chairLegGeometry, chairWoodMaterial);
            chairLeg2.position.set(0.2, 0.25, 1.1);
            group.add(chairLeg2);

            const chairLeg3 = new THREE.Mesh(chairLegGeometry, chairWoodMaterial);
            chairLeg3.position.set(-0.2, 0.25, 1.5);
            group.add(chairLeg3);

            const chairLeg4 = new THREE.Mesh(chairLegGeometry, chairWoodMaterial);
            chairLeg4.position.set(0.2, 0.25, 1.5);
            group.add(chairLeg4);

            // 의자 등받이
            const backrestGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.05);
            const backrest = new THREE.Mesh(backrestGeometry, chairWoodMaterial);
            backrest.position.set(0, 0.75, 1.55);
            group.add(backrest);

            // 조명
            const light = new THREE.PointLight(0x00ff00, 1, 5);
            light.position.set(0, 1.5, 0);
            group.add(light);

            group.position.set(5, 0, 8); // 오른쪽벽(Z=10)
            group.rotation.y = Math.PI; // 오른쪽벽 향함
            return group;
        }

        const workDesk = createWorkDesk();
        scene.add(workDesk);

        // 아케이드 오락기
        function createArcadeMachine() {
            const group = new THREE.Group();

            // 본체 (단순 박스)
            const baseGeometry = new THREE.BoxGeometry(1.8, 2.2, 1.2);
            const baseMaterial = new THREE.MeshToonMaterial({
                color: 0x1a1a1a, // 검은색
            });
            const base = new THREE.Mesh(baseGeometry, baseMaterial);
            base.position.set(0, 1.1, 0);
            group.add(base);

            // 화면 - 본체 앞쪽 상단에 튀어나오게
            const screenGeometry = new THREE.BoxGeometry(1.4, 1.0, 0.15);
            const screenMaterial = new THREE.MeshToonMaterial({
                color: 0xffffff,
                emissive: 0xffffff,
                emissiveIntensity: 0.3
            });
            const screen = new THREE.Mesh(screenGeometry, screenMaterial);
            screen.position.set(0, 1.8, 0.7); // Z를 앞으로 (본체 앞면 0.6 밖)
            group.add(screen);
            group.userData.screen = screen;

            // 화면 베젤
            const bezelGeometry = new THREE.BoxGeometry(1.5, 1.1, 0.1);
            const bezelMaterial = new THREE.MeshToonMaterial({ color: 0x1a1a1a });
            const bezel = new THREE.Mesh(bezelGeometry, bezelMaterial);
            bezel.position.set(0, 1.8, 0.62);
            group.add(bezel);

            // 조작 패널 - 허리 높이 (팔 닿는 곳)
            const panelGeometry = new THREE.BoxGeometry(1.6, 0.12, 0.6);
            const panelMaterial = new THREE.MeshToonMaterial({ color: 0x2a2a2a });
            const panel = new THREE.Mesh(panelGeometry, panelMaterial);
            panel.position.set(0, 0.9, 0.75); // 팔 높이에 맞춤
            panel.rotation.x = Math.PI / 8;
            group.add(panel);

            // 버튼들 - 2줄 3열 (팔 각도 30도에 맞춤)
            const buttonGeometry = new THREE.CylinderGeometry(0.11, 0.11, 0.08, 16);
            const buttonColors = [
                0xff0000, 0xffff00, 0x00ff00,
                0x0000ff, 0xff00ff, 0x00ffff
            ];

            for (let i = 0; i < 6; i++) {
                const buttonMaterial = new THREE.MeshToonMaterial({
                    color: buttonColors[i],
                    emissive: buttonColors[i],
                    emissiveIntensity: 1.0
                });
                const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
                const row = Math.floor(i / 3);
                const col = i % 3;
                // 버튼을 경사면 아래쪽으로 더 내림
                button.position.set(-0.35 + col * 0.35, 0.88 - row * 0.1, 0.82 - row * 0.08);
                button.rotation.x = Math.PI / 2 + Math.PI / 8;
                group.add(button);
            }

            // 코인 투입구
            const coinSlotGeometry = new THREE.BoxGeometry(0.22, 0.05, 0.12);
            const coinSlotMaterial = new THREE.MeshToonMaterial({ color: 0x333333 });
            const coinSlot = new THREE.Mesh(coinSlotGeometry, coinSlotMaterial);
            coinSlot.position.set(0.6, 0.80, 0.75); // 1.35 → 0.80
            coinSlot.rotation.x = -Math.PI / 6;
            group.add(coinSlot);

            // 조명 효과
            const light = new THREE.PointLight(0x00ffff, 2, 4);
            light.position.set(0, 3, 0.7);
            group.add(light);

            group.position.set(-1.5, 0, 8); // 오른쪽벽(Z=10)
            group.rotation.y = Math.PI; // 오른쪽벽 향함
            return group;
        }

        const arcadeMachine = createArcadeMachine();
        scene.add(arcadeMachine);

        // 피아노
        function createPiano() {
            const group = new THREE.Group();

            // 피아노 본체 (업라이트 피아노)
            const bodyGeometry = new THREE.BoxGeometry(1.8, 1.2, 0.6);
            const bodyMaterial = new THREE.MeshToonMaterial({ color: 0x1a1a1a });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.position.set(0, 0.6, 0);
            group.add(body);

            // 피아노 상단부
            const topGeometry = new THREE.BoxGeometry(1.8, 0.6, 0.65);
            const topMaterial = new THREE.MeshToonMaterial({ color: 0x0a0a0a });
            const top = new THREE.Mesh(topGeometry, topMaterial);
            top.position.set(0, 1.5, 0);
            group.add(top);

            // 건반 덮개
            const lidGeometry = new THREE.BoxGeometry(1.7, 0.05, 0.5);
            const lidMaterial = new THREE.MeshToonMaterial({ color: 0x2a2a2a });
            const lid = new THREE.Mesh(lidGeometry, lidMaterial);
            lid.position.set(0, 0.75, 0.35);
            group.add(lid);

            // 흰 건반
            const whiteKeyGeometry = new THREE.BoxGeometry(0.12, 0.02, 0.5);
            const whiteKeyMaterial = new THREE.MeshToonMaterial({ color: 0xffffff });

            for (let i = 0; i < 14; i++) {
                const whiteKey = new THREE.Mesh(whiteKeyGeometry, whiteKeyMaterial);
                whiteKey.position.set(-0.84 + i * 0.12, 0.72, 0.35);
                group.add(whiteKey);
            }

            // 검은 건반
            const blackKeyGeometry = new THREE.BoxGeometry(0.08, 0.03, 0.3);
            const blackKeyMaterial = new THREE.MeshToonMaterial({ color: 0x0a0a0a });

            const blackKeyPositions = [0, 1, 3, 4, 5, 7, 8, 10, 11, 12];
            for (let i = 0; i < blackKeyPositions.length; i++) {
                const blackKey = new THREE.Mesh(blackKeyGeometry, blackKeyMaterial);
                blackKey.position.set(-0.78 + blackKeyPositions[i] * 0.12, 0.74, 0.25);
                group.add(blackKey);
            }

            // 피아노 의자
            const seatGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.05, 16);
            const seatMaterial = new THREE.MeshToonMaterial({ color: 0x3a3a3a });
            const seat = new THREE.Mesh(seatGeometry, seatMaterial);
            seat.position.set(0, 0.5, 0.9);
            group.add(seat);

            // 의자 다리
            const chairLegGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.5, 8);
            const chairLegMaterial = new THREE.MeshToonMaterial({ color: 0x2a2a2a });
            const chairLeg = new THREE.Mesh(chairLegGeometry, chairLegMaterial);
            chairLeg.position.set(0, 0.25, 0.9);
            group.add(chairLeg);

            group.position.set(3, 0, -8); // 왼쪽벽(Z=-10)
            group.rotation.y = 0; // 왼쪽벽 향함
            return group;
        }

        const piano = createPiano();
        scene.add(piano);

        // 운동기구 (윗몸일으키기 벤치 + 런닝머신)
        function createGymEquipment() {
            const group = new THREE.Group();

            // 윗몸일으키기 벤치 제거됨

            // 런닝머신 (고급형)
            const treadmillGroup = new THREE.Group();

            // 메인 베이스 프레임 (두껍고 견고, 좌우 1칸 더 넓게)
            const baseFrameGeometry = new THREE.BoxGeometry(1.7, 0.3, 2.0);
            const baseFrameMaterial = new THREE.MeshToonMaterial({
                color: 0x2a2a2a,
                emissive: 0x1a1a1a,
                emissiveIntensity: 0.1
            });
            const baseFrame = new THREE.Mesh(baseFrameGeometry, baseFrameMaterial);
            baseFrame.position.set(0, 0.15, 0);
            treadmillGroup.add(baseFrame);

            // 러닝 벨트 (검은색, 경사, 좌우 넓게)
            const beltGeometry = new THREE.BoxGeometry(1.4, 0.08, 1.6);
            const beltMaterial = new THREE.MeshToonMaterial({
                color: 0x0a0a0a,
                emissive: 0x1a1a1a,
                emissiveIntensity: 0.2
            });
            const belt = new THREE.Mesh(beltGeometry, beltMaterial);
            belt.position.set(0, 0.34, 0);
            treadmillGroup.add(belt);

            // 측면 발판 (왼쪽)
            const footboardGeometry = new THREE.BoxGeometry(0.15, 0.05, 1.6);
            const footboardMaterial = new THREE.MeshToonMaterial({ color: 0x3a3a3a });
            const leftFootboard = new THREE.Mesh(footboardGeometry, footboardMaterial);
            leftFootboard.position.set(-0.85, 0.36, 0);
            treadmillGroup.add(leftFootboard);

            // 측면 발판 (오른쪽)
            const rightFootboard = new THREE.Mesh(footboardGeometry, footboardMaterial);
            rightFootboard.position.set(0.85, 0.36, 0);
            treadmillGroup.add(rightFootboard);

            // 프레임 기둥 (왼쪽, 더 두껍게)
            const poleGeometry = new THREE.BoxGeometry(0.08, 1.5, 0.08);
            const poleMaterial = new THREE.MeshToonMaterial({
                color: 0x2a2a2a,
                emissive: 0x3a3a3a,
                emissiveIntensity: 0.2
            });

            const leftPole = new THREE.Mesh(poleGeometry, poleMaterial);
            leftPole.position.set(-0.5, 1.05, -0.6);
            treadmillGroup.add(leftPole);

            // 프레임 기둥 (오른쪽)
            const rightPole = new THREE.Mesh(poleGeometry, poleMaterial);
            rightPole.position.set(0.5, 1.05, -0.6);
            treadmillGroup.add(rightPole);

            // 상단 연결 바
            const topBarGeometry = new THREE.BoxGeometry(1.1, 0.06, 0.06);
            const topBar = new THREE.Mesh(topBarGeometry, poleMaterial);
            topBar.position.set(0, 1.8, -0.6);
            treadmillGroup.add(topBar);

            // 손잡이 레일 (왼쪽)
            const railGeometry = new THREE.BoxGeometry(0.05, 0.05, 1.3);
            const railMaterial = new THREE.MeshToonMaterial({
                color: 0x4a4a4a,
                emissive: 0x5a5a5a,
                emissiveIntensity: 0.3
            });
            const leftRail = new THREE.Mesh(railGeometry, railMaterial);
            leftRail.position.set(-0.5, 1.2, 0.1);
            treadmillGroup.add(leftRail);

            // 손잡이 레일 (오른쪽)
            const rightRail = new THREE.Mesh(railGeometry, railMaterial);
            rightRail.position.set(0.5, 1.2, 0.1);
            treadmillGroup.add(rightRail);

            // 중앙 손잡이 바
            const centerHandleGeometry = new THREE.BoxGeometry(0.7, 0.05, 0.05);
            const centerHandle = new THREE.Mesh(centerHandleGeometry, railMaterial);
            centerHandle.position.set(0, 1.0, -0.6);
            treadmillGroup.add(centerHandle);

            // 대형 디스플레이 화면 (터치스크린 느낌)
            const displayGeometry = new THREE.BoxGeometry(0.7, 0.45, 0.05);
            const displayMaterial = new THREE.MeshToonMaterial({
                color: 0x0a0a0a,
                emissive: 0x00aaff,
                emissiveIntensity: 0.7
            });
            const display = new THREE.Mesh(displayGeometry, displayMaterial);
            display.position.set(0, 1.5, -0.68);
            display.rotation.x = -Math.PI / 10;
            treadmillGroup.add(display);

            // 디스플레이 베젤
            const bezelGeometry = new THREE.BoxGeometry(0.75, 0.5, 0.04);
            const bezelMaterial = new THREE.MeshToonMaterial({ color: 0x1a1a1a });
            const bezel = new THREE.Mesh(bezelGeometry, bezelMaterial);
            bezel.position.set(0, 1.5, -0.7);
            bezel.rotation.x = -Math.PI / 10;
            treadmillGroup.add(bezel);

            // LED 액센트 라인 (왼쪽)
            const ledGeometry = new THREE.BoxGeometry(0.02, 1.4, 0.02);
            const ledMaterial = new THREE.MeshToonMaterial({
                color: 0x00ff88,
                emissive: 0x00ff88,
                emissiveIntensity: 0.8
            });
            const leftLED = new THREE.Mesh(ledGeometry, ledMaterial);
            leftLED.position.set(-0.54, 1.05, -0.6);
            treadmillGroup.add(leftLED);

            // LED 액센트 라인 (오른쪽)
            const rightLED = new THREE.Mesh(ledGeometry, ledMaterial);
            rightLED.position.set(0.54, 1.05, -0.6);
            treadmillGroup.add(rightLED);

            // 컨트롤 패널 버튼들
            const buttonGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.02, 8);
            const buttonMaterial = new THREE.MeshToonMaterial({
                color: 0xff3333,
                emissive: 0xff3333,
                emissiveIntensity: 0.5
            });

            for (let i = 0; i < 3; i++) {
                const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
                button.position.set(-0.15 + i * 0.15, 1.25, -0.62);
                button.rotation.x = Math.PI / 2 - Math.PI / 10;
                treadmillGroup.add(button);
            }

            treadmillGroup.position.set(1.5, 0, 0);
            group.add(treadmillGroup);

            group.position.set(-5, 0, -8); // 왼쪽벽(Z=-10)
            group.rotation.y = 0; // 왼쪽벽 향함
            return group;
        }

        const gymEquipment = createGymEquipment();
        scene.add(gymEquipment);

        // 쇼파 (타일 3칸 크기: 3x1 유닛)
        function createSofa() {
            const group = new THREE.Group();

            const sofaMaterial = new THREE.MeshToonMaterial({
                color: 0x2a2a2a, // 어두운 회색
            });

            // 쇼파 베이스 (좌석) - 3x1 크기
            const seatGeometry = new THREE.BoxGeometry(3, 0.4, 0.8);
            const seat = new THREE.Mesh(seatGeometry, sofaMaterial);
            seat.position.set(0, 0.4, 0);
            group.add(seat);

            // 쇼파 등받이 - 3칸 전체
            const backrestGeometry = new THREE.BoxGeometry(3, 0.8, 0.2);
            const backrest = new THREE.Mesh(backrestGeometry, sofaMaterial);
            backrest.position.set(0, 0.8, -0.3);
            group.add(backrest);

            // 쇼파 팔걸이 (왼쪽)
            const leftArmGeometry = new THREE.BoxGeometry(0.2, 0.6, 0.8);
            const leftArm = new THREE.Mesh(leftArmGeometry, sofaMaterial);
            leftArm.position.set(-1.4, 0.6, 0);
            group.add(leftArm);

            // 쇼파 팔걸이 (오른쪽)
            const rightArmGeometry = new THREE.BoxGeometry(0.2, 0.6, 0.8);
            const rightArm = new THREE.Mesh(rightArmGeometry, sofaMaterial);
            rightArm.position.set(1.4, 0.6, 0);
            group.add(rightArm);

            // 푹신한 매트 1개 (전체를 덮는 쿠션)
            const mattressGeometry = new THREE.BoxGeometry(2.8, 0.2, 0.7);
            const mattressMaterial = new THREE.MeshToonMaterial({
                color: 0xffffff, // 흰색 쿠션
            });

            const mattress = new THREE.Mesh(mattressGeometry, mattressMaterial);
            mattress.position.set(0, 0.7, 0.05); // 좌석 위에 부드럽게 배치
            group.add(mattress);

            // 위치: 중앙에서 정면벽(X=10) 향하도록 배치
            group.position.set(0, 0, 0); // 중앙
            group.rotation.y = Math.PI / 2; // 등받이가 정면벽(X=10) 향함
            return group;
        }

        const sofa = createSofa();
        scene.add(sofa);

        // ========================================
        // 상호작용 시스템 - 객체 지향 리팩토링
        // ========================================
        //
        // 개선 사항:
        // 1. 각 오브젝트(쇼파, 오락기, 런닝머신)의 상호작용 로직을 독립적인 핸들러로 분리
        // 2. 공통 로직(거리 계산, 상호작용 가능 여부 체크)을 ObjectInteractionHandler 클래스로 추출
        // 3. F키 상호작용 처리를 handleFKeyInteraction() 함수로 통합
        // 4. 오브젝트 추가 시 새 핸들러만 생성하면 되어 확장성 향상
        //
        // 사용 방법:
        // - 새 오브젝트 추가: new ObjectInteractionHandler({ ... })로 핸들러 생성 후 interactionHandlers에 등록
        // - F키 눌렀을 때: handleFKeyInteraction()이 자동으로 가장 가까운 오브젝트 찾아서 상호작용 처리
        // ========================================

        // 공통 상태 관리 (현재 미사용, 향후 확장 가능)
        const InteractionState = {
            currentGsapTimeline: null,
            pathWaypoints: [],
            currentWaypointIndex: 0,
            activeObject: null, // 현재 상호작용 중인 오브젝트

            resetTimeline() {
                if (this.currentGsapTimeline) {
                    this.currentGsapTimeline.kill();
                    this.currentGsapTimeline = null;
                }
            },

            resetPath() {
                this.pathWaypoints = [];
                this.currentWaypointIndex = 0;
            },

            isAnimating() {
                return this.currentGsapTimeline && this.currentGsapTimeline.isActive();
            }
        };

        /**
         * 개별 오브젝트 상호작용 핸들러 클래스
         *
         * 각 오브젝트의 상호작용 로직을 캡슐화하여 독립적으로 관리
         * 이를 통해 오브젝트별 로직이 섞이는 문제를 해결
         */
        class ObjectInteractionHandler {
            /**
             * @param {Object} config - 핸들러 설정
             * @param {string} config.name - 오브젝트 이름
             * @param {THREE.Vector3} config.position - 오브젝트 위치
             * @param {THREE.Vector3} config.frontPosition - 상호작용 시작 위치
             * @param {THREE.Vector3} config.centerPosition - 중앙 위치 (선택)
             * @param {number} config.interactionRange - 상호작용 가능 거리
             * @param {number} config.width - 오브젝트 너비
             * @param {number} config.depth - 오브젝트 깊이
             * @param {number} config.pathDepth - 경로 찾기용 깊이 (선택)
             * @param {Function} config.onStart - 상호작용 시작 콜백
             * @param {Function} config.onStop - 상호작용 종료 콜백
             * @param {Function} config.canInteractFrom - 위치별 상호작용 가능 여부 체크
             * @param {Function} config.onInteract - 상호작용 처리 함수 (선택)
             * @param {Function} config.findPath - 경로 찾기 함수 (선택)
             */
            constructor(config) {
                this.name = config.name;
                this.position = config.position;
                this.frontPosition = config.frontPosition;
                this.centerPosition = config.centerPosition || config.frontPosition;
                this.interactionRange = config.interactionRange || 1.5;
                this.width = config.width || 0.6;
                this.depth = config.depth || 2.8;
                this.pathDepth = config.pathDepth || this.depth;

                // 상태
                this.isActive = false;
                this.isWalking = false;
                this.isAnimating = false;

                // 콜백
                this.onStart = config.onStart || (() => {});
                this.onStop = config.onStop || (() => {});
                this.canInteractFrom = config.canInteractFrom || (() => true);
                this.onInteract = config.onInteract || null;
                this.findPath = config.findPath || null;
            }

            /**
             * 캐릭터로부터 오브젝트 표면까지의 거리 계산 (AABB 방식)
             * @param {THREE.Vector3} charPos - 캐릭터 위치
             * @returns {number} 거리
             */
            getDistanceFrom(charPos) {
                const dx = Math.max(0, Math.abs(charPos.x - this.position.x) - this.width / 2);
                const dz = Math.max(0, Math.abs(charPos.z - this.position.z) - this.depth / 2);
                return Math.sqrt(dx * dx + dz * dz);
            }

            /**
             * 캐릭터 위치에서 상호작용 가능 여부 체크
             * @param {THREE.Vector3} charPos - 캐릭터 위치
             * @returns {boolean} 상호작용 가능 여부
             */
            canInteract(charPos) {
                const distance = this.getDistanceFrom(charPos);
                if (distance >= this.interactionRange) return false;
                return this.canInteractFrom(charPos, this.position);
            }

            /**
             * 상호작용 시작 (애니메이션 실행)
             */
            start() {
                this.isActive = true;
                this.onStart();
            }

            /**
             * 상호작용 종료 (애니메이션 중지)
             */
            stop() {
                this.isActive = false;
                this.onStop();
            }

            /**
             * 상호작용 처리 (경로 찾기 + 시작/종료)
             * @param {Object} context - 상호작용 컨텍스트
             * @returns {boolean} 상호작용 성공 여부
             */
            interact(context) {
                // 커스텀 상호작용 로직이 있으면 실행
                if (this.onInteract) {
                    return this.onInteract(context);
                }

                // 기본 상호작용 로직
                return this.defaultInteract(context);
            }

            /**
             * 기본 상호작용 로직 (경로 찾기 + 토글)
             * @param {Object} context - 상호작용 컨텍스트
             * @returns {boolean} 상호작용 성공 여부
             */
            defaultInteract(context) {
                const { character, pathWaypoints, currentWaypointIndex } = context;

                // 현재 상태 확인
                if (!this.isActive) {
                    // 거리 체크
                    const distanceToFront = character.position.distanceTo(this.frontPosition);
                    const requiredDistance = this.name === 'treadmill' ? 0.3 : 0.5;

                    if (distanceToFront > requiredDistance) {
                        // 경로 찾기
                        const path = this.findPath ?
                            this.findPath(character.position, this.frontPosition, this.position, this.width, this.pathDepth) :
                            findPathAroundObject(character.position, this.frontPosition, this.position, this.width, this.pathDepth);

                        if (path.length > 0) {
                            context.pathWaypoints.length = 0;
                            context.pathWaypoints.push(...path);
                            context.currentWaypointIndex = 0;
                            context.targetPosition = path[0].clone();
                            context.isMoving = true;
                            this.isWalking = true;
                            console.log(`${this.name} 경로 찾기 완료: ${path.length}개 웨이포인트`);
                            return true;
                        }
                    } else {
                        // 거리가 충분히 가까우면 바로 시작
                        this.start();
                        return true;
                    }
                } else {
                    // 이미 활성화 상태면 중지
                    this.stop();
                    return true;
                }

                return false;
            }

            /**
             * 핸들러 상태 초기화
             */
            reset() {
                this.isActive = false;
                this.isWalking = false;
                this.isAnimating = false;
            }
        }

        // 쇼파 핸들러
        const sofaHandler = new ObjectInteractionHandler({
            name: 'sofa',
            position: new THREE.Vector3(0, 0, 0),
            frontPosition: new THREE.Vector3(0.9, 0.5, 0),
            centerPosition: new THREE.Vector3(0.3, 0.7, 0),
            width: 0.6,
            depth: 2.8,
            interactionRange: 1.5,
            onStart: () => startSittingAnimation(),
            onStop: () => startStandingAnimation(),
            findPath: (start, goal) => findPathAroundSofa(start, goal),
            onInteract: function() {
                if (!isSitting) {
                    const distanceToFront = character.position.distanceTo(this.frontPosition);
                    if (distanceToFront > 0.5) {
                        const path = findPathAroundSofa(character.position, this.frontPosition);
                        if (path.length > 0) {
                            pathWaypoints.length = 0;
                            pathWaypoints.push(...path);
                            currentWaypointIndex = 0;
                            targetPosition = path[0].clone();
                            isMoving = true;
                            isWalkingToSofa = true;
                            console.log(`쇼파 경로 찾기 완료: ${path.length}개 웨이포인트`);
                            return true;
                        }
                    } else {
                        isSitting = true;
                        this.start();
                        return true;
                    }
                } else {
                    isSitting = false;
                    this.stop();
                    return true;
                }
                return false;
            }
        });

        // 오락기 핸들러
        const arcadeHandler = new ObjectInteractionHandler({
            name: 'arcade',
            position: new THREE.Vector3(-1.5, 0, 8),
            frontPosition: new THREE.Vector3(-1.54, 0.5, 6.68),
            width: 1.8,
            depth: 2.0,
            pathDepth: 1.2,
            interactionRange: 1.5,
            canInteractFrom: (charPos, objPos) => {
                // 오락기 뒤쪽에서는 상호작용 불가
                if (charPos.z > objPos.z) return false;
                // 좌우 범위 체크
                if (Math.abs(charPos.x - objPos.x) > (1.8 / 2 + 1.5)) return false;
                return true;
            },
            onStart: () => startArcadeAnimation(),
            onStop: () => stopArcadeAnimation(),
            onInteract: function() {
                if (!isPlayingArcade) {
                    const distanceToFront = character.position.distanceTo(this.frontPosition);
                    if (distanceToFront > 0.5) {
                        const path = findPathAroundObject(
                            character.position,
                            this.frontPosition,
                            this.position,
                            this.width,
                            this.pathDepth
                        );
                        if (path.length > 0) {
                            pathWaypoints.length = 0;
                            pathWaypoints.push(...path);
                            currentWaypointIndex = 0;
                            targetPosition = path[0].clone();
                            isMoving = true;
                            isWalkingToArcade = true;
                            console.log(`오락기 경로 찾기 완료: ${path.length}개 웨이포인트`);
                            return true;
                        }
                    } else {
                        isPlayingArcade = true;
                        this.start();
                        return true;
                    }
                } else {
                    isPlayingArcade = false;
                    this.stop();
                    return true;
                }
                return false;
            }
        });

        // 런닝머신 핸들러
        const treadmillHandler = new ObjectInteractionHandler({
            name: 'treadmill',
            position: new THREE.Vector3(-3.5, 0, -8),
            frontPosition: new THREE.Vector3(-3.5, 0.5, -6.7),
            width: 1.5,
            depth: 2.0,
            pathDepth: 1.8,
            interactionRange: 1.5,
            canInteractFrom: (charPos, objPos) => {
                // 런닝머신 뒤쪽에서는 상호작용 불가
                if (charPos.z < objPos.z) return false;
                // 좌우 범위 체크
                if (Math.abs(charPos.x - objPos.x) > (1.7 / 2 + 1.5)) return false;
                return true;
            },
            onStart: () => startTreadmillAnimation(),
            onStop: () => stopTreadmillAnimation(),
            onInteract: function() {
                if (!isRunningTreadmill) {
                    const distanceToFront = character.position.distanceTo(this.frontPosition);
                    if (distanceToFront > 0.3) {
                        const path = findPathAroundObject(
                            character.position,
                            this.frontPosition,
                            this.position,
                            this.width,
                            this.pathDepth
                        );
                        if (path.length > 0) {
                            pathWaypoints.length = 0;
                            pathWaypoints.push(...path);
                            currentWaypointIndex = 0;
                            targetPosition = path[0].clone();
                            isMoving = true;
                            isWalkingToTreadmill = true;
                            console.log(`런닝머신 경로 찾기 완료: ${path.length}개 웨이포인트`);
                            return true;
                        }
                    } else {
                        isRunningTreadmill = true;
                        this.start();
                        return true;
                    }
                } else {
                    isRunningTreadmill = false;
                    this.stop();
                    return true;
                }
                return false;
            }
        });

        // 모든 핸들러 관리
        const interactionHandlers = {
            sofa: sofaHandler,
            arcade: arcadeHandler,
            treadmill: treadmillHandler
        };

        // 하위 호환성을 위한 별칭 변수들 (기존 코드가 사용)
        let isSitting = false;
        let isWalkingToSofa = false;
        let isWalkingToStand = false;
        let isPlayingArcade = false;
        let isWalkingToArcade = false;
        let isRunningTreadmill = false;
        let isWalkingToTreadmill = false;
        let isTreadmillAnimating = false;

        let sofaCenterPosition = sofaHandler.centerPosition;
        let sofaPosition = sofaHandler.position;
        let sofaFrontPosition = sofaHandler.frontPosition;
        let sofaInteractionRadius = sofaHandler.interactionRange;

        let arcadePosition = arcadeHandler.position;
        let arcadeFrontPosition = arcadeHandler.frontPosition;
        let arcadeInteractionRadius = arcadeHandler.interactionRange;

        let treadmillPosition = treadmillHandler.position;
        let treadmillFrontPosition = treadmillHandler.frontPosition;
        let treadmillInteractionRange = treadmillHandler.interactionRange;

        let standingBodyRotation = 0;
        let sittingBodyRotation = Math.PI / 12;
        let currentGsapTimeline = null;
        let pathWaypoints = [];
        let currentWaypointIndex = 0;

        // ========================================
        // F키 상호작용 통합 핸들러
        // ========================================
        function handleFKeyInteraction() {
            console.log('F키 눌림!');

            // 인트로 중이면 무시
            if (sceneState === 'ROOM_INTRO') {
                console.log('인트로 진행 중 - F키 무시');
                return;
            }

            // 이동 중이면 무시 (플레이/달리기 중은 허용)
            if (isWalkingToSofa || isWalkingToStand || isWalkingToArcade || isWalkingToTreadmill) {
                console.log('이동 중 - F키 무시');
                return;
            }

            // 앉기/일어서기/올라가기 애니메이션 진행 중이면 무시 (오락기 플레이/런닝머신 달리기는 허용)
            if (currentGsapTimeline && currentGsapTimeline.isActive() && !isPlayingArcade && !isRunningTreadmill) {
                console.log('애니메이션 진행 중 - F키 무시');
                return;
            }

            // 런닝머신 올라가기/내리기 애니메이션 중이면 무시
            if (isTreadmillAnimating) {
                console.log('런닝머신 애니메이션 중 - F키 무시');
                return;
            }

            // 가까운 오브젝트 찾기 (리팩토링된 방식)
            let nearestHandler = null;
            let nearestDistance = Infinity;

            for (const handler of Object.values(interactionHandlers)) {
                if (!handler.canInteract(character.position)) {
                    continue;
                }

                const distance = handler.getDistanceFrom(character.position);
                if (distance < nearestDistance) {
                    nearestDistance = distance;
                    nearestHandler = handler;
                }
            }

            if (!nearestHandler) {
                console.log('상호작용 가능한 오브젝트 없음');
                return;
            }

            console.log(`${nearestHandler.name} 상호작용 (거리: ${nearestDistance.toFixed(2)})`);

            // 오브젝트별 상호작용 처리
            handleObjectInteraction(nearestHandler);
        }

        // 개별 오브젝트 상호작용 처리
        function handleObjectInteraction(handler) {
            // 진행 중인 GSAP 애니메이션 중단 (현재 플레이 중이 아닐 때만)
            if (!handler.isActive) {
                if (currentGsapTimeline) {
                    currentGsapTimeline.kill();
                    currentGsapTimeline = null;
                }
            }

            // 컨텍스트 전달 - 핸들러가 상호작용 처리에 필요한 모든 정보
            const interactionContext = {
                character: character,
                pathWaypoints: pathWaypoints,
                currentWaypointIndex: currentWaypointIndex,
                targetPosition: targetPosition,
                isMoving: isMoving,
                currentGsapTimeline: currentGsapTimeline
            };

            // 핸들러의 interact() 메서드 호출 - 로직 완전 분리
            handler.interact(interactionContext);
        }

        // 범용 경로 찾기 함수 (박스 오브젝트 회피)
        // backDirection: 'x' (쇼파처럼 X축 뒤에서 접근) 또는 'z' (런닝머신처럼 Z축 뒤에서 접근)
        function findPathAroundObject(start, goal, objPosition, objWidth, objDepth, backDirection = 'x') {
            const characterRadius = 0.3;
            const objBox = {
                minX: objPosition.x - objWidth / 2 - characterRadius,
                maxX: objPosition.x + objWidth / 2 + characterRadius,
                minZ: objPosition.z - objDepth / 2 - characterRadius,
                maxZ: objPosition.z + objDepth / 2 + characterRadius
            };

            // 선분이 AABB와 교차하는지 확인 (2D line-box intersection)
            function lineIntersectsBox(p1, p2, box) {
                // 시작점이나 끝점이 박스 안에 있으면 교차
                if ((p1.x >= box.minX && p1.x <= box.maxX && p1.z >= box.minZ && p1.z <= box.maxZ) ||
                    (p2.x >= box.minX && p2.x <= box.maxX && p2.z >= box.minZ && p2.z <= box.maxZ)) {
                    return true;
                }

                // Liang-Barsky 알고리즘으로 선분-박스 교차 검사
                const dx = p2.x - p1.x;
                const dz = p2.z - p1.z;

                let tMin = 0;
                let tMax = 1;

                // X축 검사
                if (dx !== 0) {
                    const t1 = (box.minX - p1.x) / dx;
                    const t2 = (box.maxX - p1.x) / dx;
                    tMin = Math.max(tMin, Math.min(t1, t2));
                    tMax = Math.min(tMax, Math.max(t1, t2));
                }

                // Z축 검사
                if (dz !== 0) {
                    const t1 = (box.minZ - p1.z) / dz;
                    const t2 = (box.maxZ - p1.z) / dz;
                    tMin = Math.max(tMin, Math.min(t1, t2));
                    tMax = Math.min(tMax, Math.max(t1, t2));
                }

                return tMin <= tMax;
            }

            const margin = 0.5;
            const path = [];

            // 직선 경로 먼저 체크
            if (!lineIntersectsBox(start, goal, objBox)) {
                // 직선 경로로 가도 안전하면 바로 목표로
                console.log('직선 경로 사용');
                return [goal];
            }

            // 충돌이 예상되면 가장 가까운 모서리를 경유
            // 단, 시작점과 같은 방향에 있는 코너만 선택 (반대편 코너 제외)
            const corners = [
                new THREE.Vector3(objBox.maxX + margin, 0.5, objBox.maxZ + margin), // 0: 오른쪽 위
                new THREE.Vector3(objBox.maxX + margin, 0.5, objBox.minZ - margin), // 1: 오른쪽 아래
                new THREE.Vector3(objBox.minX - margin, 0.5, objBox.maxZ + margin), // 2: 왼쪽 위
                new THREE.Vector3(objBox.minX - margin, 0.5, objBox.minZ - margin)  // 3: 왼쪽 아래
            ];

            console.log(`시작: (${start.x.toFixed(2)}, ${start.z.toFixed(2)}), 목표: (${goal.x.toFixed(2)}, ${goal.z.toFixed(2)})`);
            console.log(`박스: X[${objBox.minX.toFixed(2)}, ${objBox.maxX.toFixed(2)}], Z[${objBox.minZ.toFixed(2)}, ${objBox.maxZ.toFixed(2)}]`);

            // 목표가 어느 방향에 있는지 확인 (시작점 기준이 아니라 목표 기준)
            const isGoalRight = goal.x > objBox.maxX;  // 목표가 박스 오른쪽
            const isGoalLeft = goal.x < objBox.minX;   // 목표가 박스 왼쪽
            const isGoalTop = goal.z > objBox.maxZ;    // 목표가 박스 위쪽
            const isGoalBottom = goal.z < objBox.minZ; // 목표가 박스 아래쪽

            let validCorners = [];

            // 목표 위치에 따라 적절한 코너 선택
            if (isGoalRight && isGoalTop) {
                // 목표가 오른쪽 위 -> 오른쪽 위 코너만
                validCorners = [corners[0]];
                console.log('목표: 오른쪽 위 - 오른쪽 위 코너 사용');
            } else if (isGoalRight && isGoalBottom) {
                // 목표가 오른쪽 아래 -> 오른쪽 아래 코너만
                validCorners = [corners[1]];
                console.log('목표: 오른쪽 아래 - 오른쪽 아래 코너 사용');
            } else if (isGoalLeft && isGoalTop) {
                // 목표가 왼쪽 위 -> 왼쪽 위 코너만
                validCorners = [corners[2]];
                console.log('목표: 왼쪽 위 - 왼쪽 위 코너 사용');
            } else if (isGoalLeft && isGoalBottom) {
                // 목표가 왼쪽 아래 -> 왼쪽 아래 코너만
                validCorners = [corners[3]];
                console.log('목표: 왼쪽 아래 - 왼쪽 아래 코너 사용');
            } else if (isGoalRight) {
                // 목표가 오른쪽 (위아래 중간)
                validCorners = [corners[0], corners[1]];
                console.log('목표: 오른쪽 - 오른쪽 코너들 고려');
            } else if (isGoalLeft) {
                // 목표가 왼쪽 (위아래 중간)
                validCorners = [corners[2], corners[3]];
                console.log('목표: 왼쪽 - 왼쪽 코너들 고려');
            } else {
                // 목표가 박스 안이나 정면/뒤 -> 모든 코너 고려
                validCorners = corners;
                console.log('목표: 박스 근처 - 모든 코너 고려');
            }

            let bestCorner = validCorners[0];
            let shortestDist = start.distanceTo(validCorners[0]) + validCorners[0].distanceTo(goal);

            for (let i = 1; i < validCorners.length; i++) {
                const dist = start.distanceTo(validCorners[i]) + validCorners[i].distanceTo(goal);
                console.log(`코너 ${i}: (${validCorners[i].x.toFixed(2)}, ${validCorners[i].z.toFixed(2)}) 거리: ${dist.toFixed(2)}`);
                if (dist < shortestDist) {
                    shortestDist = dist;
                    bestCorner = validCorners[i];
                }
            }
            console.log(`선택된 코너: (${bestCorner.x.toFixed(2)}, ${bestCorner.z.toFixed(2)})`);
            path.push(bestCorner);
            path.push(goal);
            return path;
        }

        // 쇼파 전용 경로 찾기 (하위 호환)
        function findPathAroundSofa(start, goal) {
            return findPathAroundObject(start, goal, sofaPosition, 0.6, 2.8);
        }

        // === 사이버펑크 맵 오브젝트 ===

        // 해킹 터미널 (네온 시안)
        function createHackingTerminal() {
            const group = new THREE.Group();

            // 모니터 본체
            const screenGeometry = new THREE.BoxGeometry(1.5, 1, 0.1);
            const screenMaterial = new THREE.MeshToonMaterial({
                color: 0x0a0a0a,
                emissive: 0x00ffff,
                emissiveIntensity: 0.3
            });
            const screen = new THREE.Mesh(screenGeometry, screenMaterial);
            screen.position.y = 0.8;
            group.add(screen);

            // 네온 테두리
            const frameGeometry = new THREE.BoxGeometry(1.6, 1.1, 0.05);
            const frameMaterial = new THREE.MeshToonMaterial({
                color: 0x00ffff,
                emissive: 0x00ffff,
                emissiveIntensity: 0.8
            });
            const frame = new THREE.Mesh(frameGeometry, frameMaterial);
            frame.position.set(0, 0.8, -0.06);
            group.add(frame);

            // 스탠드
            const standGeometry = new THREE.CylinderGeometry(0.05, 0.15, 0.5, 8);
            const standMaterial = new THREE.MeshToonMaterial({ color: 0x1a1a1a });
            const stand = new THREE.Mesh(standGeometry, standMaterial);
            stand.position.y = 0.25;
            group.add(stand);

            // 포인트 라이트 (시안 글로우)
            const light = new THREE.PointLight(0x00ffff, 1, 5);
            light.position.set(0, 0.8, 0.5);
            group.add(light);

            group.position.set(-7, 0, -4); // 시계방향 90도 회전
            return group;
        }

        // 홀로그램 프로젝터 (네온 핑크)
        function createHologramProjector() {
            const group = new THREE.Group();

            // 베이스
            const baseGeometry = new THREE.CylinderGeometry(0.3, 0.4, 0.1, 16);
            const baseMaterial = new THREE.MeshToonMaterial({
                color: 0x1a1a1a,
                emissive: 0xff00ff,
                emissiveIntensity: 0.2
            });
            const base = new THREE.Mesh(baseGeometry, baseMaterial);
            base.position.y = 0.05;
            group.add(base);

            // 홀로그램 (반투명 핑크)
            const holoGeometry = new THREE.ConeGeometry(0.5, 1.5, 6);
            const holoMaterial = new THREE.MeshToonMaterial({
                color: 0xff00ff,
                transparent: true,
                opacity: 0.4,
                emissive: 0xff00ff,
                emissiveIntensity: 0.8
            });
            const holo = new THREE.Mesh(holoGeometry, holoMaterial);
            holo.position.y = 0.9;
            group.add(holo);

            // 포인트 라이트 (핑크 글로우)
            const light = new THREE.PointLight(0xff00ff, 1.5, 5);
            light.position.set(0, 1, 0);
            group.add(light);

            group.position.set(-7, 0, 4); // 시계방향 90도 회전
            return group;
        }

        // 서버랙 (네온 그린)
        function createServerRack() {
            const group = new THREE.Group();

            // 본체
            const rackGeometry = new THREE.BoxGeometry(1, 2, 0.5);
            const rackMaterial = new THREE.MeshToonMaterial({
                color: 0x0a0a0a,
                emissive: 0x00ff00,
                emissiveIntensity: 0.2
            });
            const rack = new THREE.Mesh(rackGeometry, rackMaterial);
            rack.position.y = 1;
            group.add(rack);

            // LED 라인들 (4개)
            for (let i = 0; i < 4; i++) {
                const ledGeometry = new THREE.BoxGeometry(0.8, 0.05, 0.02);
                const ledMaterial = new THREE.MeshToonMaterial({
                    color: 0x00ff00,
                    emissive: 0x00ff00,
                    emissiveIntensity: 1
                });
                const led = new THREE.Mesh(ledGeometry, ledMaterial);
                led.position.set(0, 0.4 + i * 0.4, 0.26);
                group.add(led);
            }

            // 포인트 라이트 (그린 글로우)
            const light = new THREE.PointLight(0x00ff00, 1, 5);
            light.position.set(0, 1, 1);
            group.add(light);

            group.position.set(0, 0, -6); // 시계방향 90도 회전
            return group;
        }

        // 자격증 전시대
        function createCertificateDisplay() {
            const group = new THREE.Group();

            // 전시대 벽
            const wallGeometry = new THREE.BoxGeometry(2.5, 2.5, 0.2);
            const wallMaterial = new THREE.MeshToonMaterial({
                color: 0x1a1a1a,
                emissive: 0x0066ff,
                emissiveIntensity: 0.1
            });
            const wall = new THREE.Mesh(wallGeometry, wallMaterial);
            wall.position.y = 1.25;
            group.add(wall);

            // 액자 3개 (자격증)
            for (let i = 0; i < 3; i++) {
                const frameGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.05);
                const frameMaterial = new THREE.MeshToonMaterial({
                    color: 0xffd700,
                    emissive: 0xffd700,
                    emissiveIntensity: 0.3
                });
                const frame = new THREE.Mesh(frameGeometry, frameMaterial);
                frame.position.set(-0.8 + i * 0.8, 1.5, 0.15);
                group.add(frame);

                // 인증서 내용
                const certGeometry = new THREE.BoxGeometry(0.5, 0.7, 0.02);
                const certMaterial = new THREE.MeshToonMaterial({ color: 0xffffff });
                const cert = new THREE.Mesh(certGeometry, certMaterial);
                cert.position.set(-0.8 + i * 0.8, 1.5, 0.18);
                group.add(cert);
            }

            // 하단 선반
            const shelfGeometry = new THREE.BoxGeometry(2.5, 0.1, 0.4);
            const shelfMaterial = new THREE.MeshToonMaterial({ color: 0x363666 });
            const shelf = new THREE.Mesh(shelfGeometry, shelfMaterial);
            shelf.position.set(0, 0.5, 0.1);
            group.add(shelf);

            // 네온 테두리
            const borderGeometry = new THREE.BoxGeometry(2.6, 2.6, 0.05);
            const borderMaterial = new THREE.MeshToonMaterial({
                color: 0x00ffff,
                emissive: 0x00ffff,
                emissiveIntensity: 0.8
            });
            const border = new THREE.Mesh(borderGeometry, borderMaterial);
            border.position.set(0, 1.25, -0.05);
            group.add(border);

            // 조명
            const light = new THREE.PointLight(0x00ffff, 1.5, 5);
            light.position.set(0, 2, 1);
            group.add(light);

            group.position.set(-8, 0, -5); // 왼쪽벽(X=-10)
            group.rotation.y = Math.PI / 2; // 왼쪽벽에서 오른쪽(방 안쪽) 향함
            return group;
        }

        // CTF 대회 전시대 (트로피)
        function createCTFTrophyShelf() {
            const group = new THREE.Group();

            // 진열대 본체
            const baseGeometry = new THREE.BoxGeometry(2, 0.1, 0.8);
            const baseMaterial = new THREE.MeshToonMaterial({
                color: 0x1a1a1a,
                emissive: 0xff00ff,
                emissiveIntensity: 0.2
            });
            const base = new THREE.Mesh(baseGeometry, baseMaterial);
            base.position.y = 0.05;
            group.add(base);

            // 3단 선반
            for (let tier = 0; tier < 3; tier++) {
                const shelfGeometry = new THREE.BoxGeometry(2, 0.05, 0.8);
                const shelf = new THREE.Mesh(shelfGeometry, baseMaterial);
                shelf.position.y = 0.6 + tier * 0.5;
                group.add(shelf);

                // 트로피/메달 배치
                const itemCount = 3 - tier;
                for (let i = 0; i < itemCount; i++) {
                    let itemGeometry, itemMaterial;

                    if (tier === 0) {
                        // 금 트로피
                        itemGeometry = new THREE.CylinderGeometry(0.08, 0.1, 0.3, 8);
                        itemMaterial = new THREE.MeshToonMaterial({
                            color: 0xffd700,
                            emissive: 0xffd700,
                            emissiveIntensity: 0.5
                        });
                    } else if (tier === 1) {
                        // 은 메달
                        itemGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.05, 16);
                        itemMaterial = new THREE.MeshToonMaterial({
                            color: 0xc0c0c0,
                            emissive: 0xc0c0c0,
                            emissiveIntensity: 0.3
                        });
                    } else {
                        // 동 배지
                        itemGeometry = new THREE.BoxGeometry(0.15, 0.15, 0.05);
                        itemMaterial = new THREE.MeshToonMaterial({
                            color: 0xcd7f32,
                            emissive: 0xcd7f32,
                            emissiveIntensity: 0.3
                        });
                    }

                    const item = new THREE.Mesh(itemGeometry, itemMaterial);
                    const spacing = itemCount === 1 ? 0 : 0.6;
                    item.position.set(-spacing/2 + i * spacing, 0.75 + tier * 0.5, 0);
                    group.add(item);
                }
            }

            // 네온 테두리
            const frameGeometry = new THREE.BoxGeometry(2.1, 1.8, 0.9);
            const frameMaterial = new THREE.MeshToonMaterial({
                color: 0xff00ff,
                emissive: 0xff00ff,
                emissiveIntensity: 0.8,
                wireframe: true
            });
            const frame = new THREE.Mesh(frameGeometry, frameMaterial);
            frame.position.y = 0.9;
            group.add(frame);

            // 조명
            const light = new THREE.PointLight(0xff00ff, 1.5, 5);
            light.position.set(0, 2, 1);
            group.add(light);

            group.position.set(-8, 0, -1); // 왼쪽벽(X=-10)
            group.rotation.y = Math.PI / 2; // 왼쪽벽에서 오른쪽(방 안쪽) 향함
            return group;
        }

        // 경력 TV (그래프 디스플레이)
        function createCareerTV() {
            const group = new THREE.Group();

            // TV 본체
            const tvGeometry = new THREE.BoxGeometry(2.5, 1.5, 0.2);
            const tvMaterial = new THREE.MeshToonMaterial({
                color: 0x0a0a0a,
                emissive: 0x00ff00,
                emissiveIntensity: 0.2
            });
            const tv = new THREE.Mesh(tvGeometry, tvMaterial);
            tv.position.y = 1.5;
            group.add(tv);

            // 스크린 (그래프)
            const canvas = document.createElement('canvas');
            canvas.width = 512;
            canvas.height = 256;
            const ctx = canvas.getContext('2d');

            // 배경
            ctx.fillStyle = '#001100';
            ctx.fillRect(0, 0, 512, 256);

            // 제목
            ctx.fillStyle = '#00ff00';
            ctx.font = 'bold 24px Arial';
            ctx.fillText('Career Timeline', 20, 35);

            // 타임라인 그래프
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 3;
            ctx.beginPath();
            const points = [
                [50, 200], [150, 150], [250, 100], [350, 80], [450, 60]
            ];
            ctx.moveTo(points[0][0], points[0][1]);
            points.forEach(p => ctx.lineTo(p[0], p[1]));
            ctx.stroke();

            // 데이터 포인트
            points.forEach(p => {
                ctx.fillStyle = '#00ffff';
                ctx.beginPath();
                ctx.arc(p[0], p[1], 5, 0, Math.PI * 2);
                ctx.fill();
            });

            // 레이블
            ctx.fillStyle = '#00ff00';
            ctx.font = '14px Arial';
            ctx.fillText('2020', 40, 220);
            ctx.fillText('2021', 140, 220);
            ctx.fillText('2022', 240, 220);
            ctx.fillText('2023', 340, 220);
            ctx.fillText('2024', 440, 220);

            const screenTexture = new THREE.CanvasTexture(canvas);
            const screenMaterial = new THREE.MeshToonMaterial({
                map: screenTexture,
                emissive: 0x00ff00,
                emissiveIntensity: 0.5
            });
            const screenGeometry = new THREE.PlaneGeometry(2.3, 1.3);
            const screen = new THREE.Mesh(screenGeometry, screenMaterial);
            screen.position.set(0, 1.5, 0.11);
            group.add(screen);

            // 스탠드
            const standGeometry = new THREE.CylinderGeometry(0.1, 0.2, 0.5, 8);
            const standMaterial = new THREE.MeshToonMaterial({ color: 0x1a1a1a });
            const stand = new THREE.Mesh(standGeometry, standMaterial);
            stand.position.y = 0.25;
            group.add(stand);

            // 네온 테두리
            const borderGeometry = new THREE.BoxGeometry(2.6, 1.6, 0.05);
            const borderMaterial = new THREE.MeshToonMaterial({
                color: 0x00ff00,
                emissive: 0x00ff00,
                emissiveIntensity: 0.8
            });
            const border = new THREE.Mesh(borderGeometry, borderMaterial);
            border.position.set(0, 1.5, -0.15);
            group.add(border);

            // 조명
            const light = new THREE.PointLight(0x00ff00, 2, 6);
            light.position.set(0, 1.5, 1);
            group.add(light);

            group.position.set(-8, 0, 3); // 왼쪽벽(X=-10)
            group.rotation.y = Math.PI / 2; // 왼쪽벽에서 오른쪽(방 안쪽) 향함
            return group;
        }

        // 수상 트로피 진열대 (기존 트로피를 앞쪽으로)
        function createAwardTrophyShelf() {
            const group = new THREE.Group();

            // 대형 트로피 (골드)
            const trophyGeometry = new THREE.CylinderGeometry(0.15, 0.2, 0.6, 8);
            const trophyMaterial = new THREE.MeshToonMaterial({
                color: 0xffd700,
                emissive: 0xffd700,
                emissiveIntensity: 0.5
            });
            const trophy = new THREE.Mesh(trophyGeometry, trophyMaterial);
            trophy.position.set(0, 0.8, 0);
            group.add(trophy);

            // 트로피 위 장식
            const topGeometry = new THREE.SphereGeometry(0.2, 8, 8);
            const top = new THREE.Mesh(topGeometry, trophyMaterial);
            top.position.set(0, 1.2, 0);
            group.add(top);

            // 받침대
            const baseGeometry = new THREE.CylinderGeometry(0.3, 0.35, 0.2, 8);
            const baseMaterial = new THREE.MeshToonMaterial({ color: 0x8b4513 });
            const base = new THREE.Mesh(baseGeometry, baseMaterial);
            base.position.y = 0.1;
            group.add(base);

            // 글로우 조명
            const light = new THREE.PointLight(0xffd700, 2, 5);
            light.position.set(0, 1.5, 1);
            group.add(light);

            group.position.set(-8, 0, 7); // 왼쪽벽(X=-10)
            group.rotation.y = Math.PI / 2; // 왼쪽벽에서 오른쪽(방 안쪽) 향함
            return group;
        }

        // 맵 오브젝트 생성 및 배치
        // 왼쪽 벽 전시대 제거됨 (CMD 창으로 교체)

        // CMD 창 생성 (왼쪽 벽 전체에 배치)
        function createCMDWindow() {
            const canvas = document.createElement('canvas');
            canvas.width = 2048;
            canvas.height = 1536;
            const ctx = canvas.getContext('2d');

            // CMD 창 배경 (검은색)
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, 2048, 1536);

            // CMD 타이틀 바
            ctx.fillStyle = '#c0c0c0';
            ctx.fillRect(0, 0, 2048, 60);

            // 타이틀 텍스트
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 36px Consolas, monospace';
            ctx.fillText('C:\\Users\\JeonYujin\\Security_Room', 20, 42);

            // CMD 컨텐츠 (초록색 텍스트)
            ctx.fillStyle = '#00ff00';
            ctx.font = '32px Consolas, monospace';

            const lines = [
                'Microsoft Windows [Version 10.0.19045.3803]',
                '(c) Security Research Lab. All rights reserved.',
                '',
                'C:\\Users\\JeonYujin> dir',
                '',
                '디렉터리: C:\\Users\\JeonYujin\\Security_Room',
                '',
                '2025-10-12  오전 10:30    <DIR>          Profile_Room',
                '2025-10-12  오전 10:30    <DIR>          Blog',
                '2025-10-12  오전 10:30    <DIR>          Research_Projects',
                '2025-10-12  오전 10:30    <DIR>          CTF_Writeups',
                '2025-10-12  오전 10:30    <DIR>          Hacking_Tools',
                '2025-10-12  오전 10:30    <DIR>          Vulnerability_Reports',
                '',
                'C:\\Users\\JeonYujin> cd Profile_Room',
                '',
                'C:\\Users\\JeonYujin\\Profile_Room> dir',
                '',
                '2025-10-12  오전 10:30           awards.txt',
                '2025-10-12  오전 10:30           career.txt',
                '2025-10-12  오전 10:30           ctf_achievements.txt',
                '2025-10-12  오전 10:30           certificates.txt',
                '',
                'C:\\Users\\JeonYujin\\Profile_Room> _'
            ];

            let yPos = 120;
            lines.forEach(line => {
                ctx.fillText(line, 40, yPos);
                yPos += 48;
            });

            // 깜빡이는 커서 효과를 위한 사각형
            ctx.fillStyle = '#00ff00';
            ctx.fillRect(680, yPos - 40, 20, 35);

            const texture = new THREE.CanvasTexture(canvas);
            const material = new THREE.MeshToonMaterial({
                map: texture,
                emissive: 0x003300,
                emissiveIntensity: 0.2
            });

            // 벽 크기에 맞춤: 높이 6, 너비는 바닥 타일 기준 약 18 정도
            const geometry = new THREE.PlaneGeometry(18, 5.5);
            const mesh = new THREE.Mesh(geometry, material);
            mesh.rotation.y = Math.PI / 2; // 왼쪽 벽에서 오른쪽(방 안쪽) 향하게
            mesh.position.set(-9.85, 3.25, 0); // 왼쪽 벽 중앙, 높이 중간

            return mesh;
        }

        const cmdWindow = createCMDWindow();
        scene.add(cmdWindow);

        // 카메라 위치 (정면벽 X=10에서 중심을 바라보는 각도)
        camera.position.set(15.06, 5.41, 0.11);
        camera.lookAt(0, 0, 0);

        // 마우스 컨트롤
        let isRightMouseDown = false;
        let previousMousePosition = { x: 0, y: 0 };
        let cameraAngle = { theta: Math.PI * 0.3, phi: Math.PI / 4 };
        let cameraDistance = 17; // const에서 let으로 변경 (줌 기능을 위해)

        // 이동 관련
        let targetPosition = null;
        let isMoving = false;
        const moveSpeed = 0.05;

        // Raycaster (클릭 감지)
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        // 마우스 이벤트
        renderer.domElement.addEventListener('mousedown', (e) => {
            if (e.button === 2) { // 우클릭
                isRightMouseDown = true;
                previousMousePosition = { x: e.clientX, y: e.clientY };
            } else if (e.button === 0) { // 좌클릭
                // Canvas 기준으로 마우스 좌표 계산
                const rect = renderer.domElement.getBoundingClientRect();
                mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
                mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

                raycaster.setFromCamera(mouse, camera);

                // 바닥과의 교차점 찾기
                const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
                const intersectPoint = new THREE.Vector3();
                raycaster.ray.intersectPlane(floorPlane, intersectPoint);

                if (intersectPoint) {
                    // 인트로 중이면 무시
                    if (sceneState === 'ROOM_INTRO') {
                        console.log('인트로 진행 중 - 마우스 클릭 무시');
                        return;
                    }

                    // 경계 체크
                    const halfSize = floorSize / 2 - 1;
                    intersectPoint.x = Math.max(-halfSize, Math.min(halfSize, intersectPoint.x));
                    intersectPoint.z = Math.max(-halfSize, Math.min(halfSize, intersectPoint.z));

                    // 상호작용 중이거나 애니메이션 진행 중이면 무시
                    if (isWalkingToSofa || isWalkingToStand || isWalkingToArcade || isWalkingToTreadmill || isPlayingArcade || isRunningTreadmill) {
                        console.log('이동/상호작용 중 - 마우스 클릭 무시');
                        return;
                    }

                    // 앉기/일어서기/올라가기 애니메이션 진행 중이면 무시
                    if (currentGsapTimeline && currentGsapTimeline.isActive()) {
                        console.log('애니메이션 진행 중 - 마우스 클릭 무시');
                        return;
                    }

                    // 진행 중인 GSAP 애니메이션 중단
                    if (currentGsapTimeline) {
                        currentGsapTimeline.kill();
                        currentGsapTimeline = null;
                    }
                    // 모든 트윈 제거
                    gsap.killTweensOf(character.position);
                    gsap.killTweensOf(character.rotation);

                    // 앉아있으면 F키와 동일하게 처리 (쇼파 앞으로 걸어가서 일어서기)
                    if (isSitting) {
                        // 먼저 쇼파 앞으로 걸어가기
                        targetPosition = sofaFrontPosition.clone();
                        isMoving = true;
                        isWalkingToStand = true; // 일어서기 위해 걸어가는 중
                    } else {
                        // 서있는 상태면 일반 이동
                        targetPosition = intersectPoint.clone();
                        targetPosition.y = 0.5; // 캐릭터 서있는 높이
                        isMoving = true;
                    }
                }
            }
        });

        renderer.domElement.addEventListener('mousemove', (e) => {
            if (isRightMouseDown) {
                const deltaX = e.clientX - previousMousePosition.x;
                const deltaY = e.clientY - previousMousePosition.y;

                cameraAngle.theta -= deltaX * 0.005;
                cameraAngle.phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.1, cameraAngle.phi - deltaY * 0.005));

                previousMousePosition = { x: e.clientX, y: e.clientY };
                updateCameraPosition();
            }
        });

        renderer.domElement.addEventListener('mouseup', (e) => {
            if (e.button === 2) {
                isRightMouseDown = false;
            }
        });

        renderer.domElement.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        // 마우스 휠로 줌 인/아웃
        renderer.domElement.addEventListener('wheel', (e) => {
            e.preventDefault();

            // 휠 방향에 따라 거리 조정
            const zoomSpeed = 0.5;
            cameraDistance += e.deltaY * 0.01 * zoomSpeed;

            // 최소/최대 거리 제한
            cameraDistance = Math.max(5, Math.min(30, cameraDistance));

            updateCameraPosition();
        });

        // 카메라 위치 업데이트
        function updateCameraPosition() {
            camera.position.x = cameraDistance * Math.sin(cameraAngle.phi) * Math.cos(cameraAngle.theta);
            camera.position.y = cameraDistance * Math.cos(cameraAngle.phi);
            camera.position.z = cameraDistance * Math.sin(cameraAngle.phi) * Math.sin(cameraAngle.theta);
            camera.lookAt(0, 0, 0);
        }

        // 충돌 감지 오브젝트 배열 (충돌 체크할 대형 오브젝트들)
        const collisionObjects = [
            { position: new THREE.Vector3(0, 0, 0), width: 0.6, depth: 2.8, type: 'box' }, // 소파 (Z축으로 길게, 실제 크기 -0.2씩)
            { position: new THREE.Vector3(-1.5, 0, 8), width: 1.8, depth: 2.0, type: 'box' }, // 오락기 (Z: 7.0 ~ 9.0)
            { position: new THREE.Vector3(-3.5, 0, -8), width: 1.5, depth: 1.8, type: 'box' }, // 런닝머신
            { position: new THREE.Vector3(5, 0, 8), radius: 2 }, // 책상 (오른쪽벽)
            { position: new THREE.Vector3(3, 0, -8), radius: 1.2 } // 피아노 (왼쪽벽)
            // 왼쪽 벽 전시대 제거됨 (CMD 창으로 교체)
        ];

        // 충돌 체크 함수
        function checkCollision(newPos) {
            const characterRadius = 0.3; // 캐릭터 반경

            for (let obj of collisionObjects) {
                if (obj.type === 'box') {
                    // 박스 충돌 체크 (AABB + 캐릭터 반경 고려)
                    const halfWidth = obj.width / 2;
                    const halfDepth = obj.depth / 2;

                    // 캐릭터를 박스로 확장하여 체크 (캐릭터 반경만큼 박스 확장)
                    const minX = obj.position.x - halfWidth - characterRadius;
                    const maxX = obj.position.x + halfWidth + characterRadius;
                    const minZ = obj.position.z - halfDepth - characterRadius;
                    const maxZ = obj.position.z + halfDepth + characterRadius;

                    // 캐릭터 중심이 확장된 박스 안에 있으면 충돌
                    if (newPos.x >= minX && newPos.x <= maxX &&
                        newPos.z >= minZ && newPos.z <= maxZ) {
                        return true; // 충돌 발생
                    }
                } else {
                    // 원형 충돌 체크
                    const distance = new THREE.Vector2(newPos.x, newPos.z).distanceTo(
                        new THREE.Vector2(obj.position.x, obj.position.z)
                    );
                    if (distance < obj.radius + characterRadius) {
                        return true; // 충돌 발생
                    }
                }
            }
            return false; // 충돌 없음
        }

        // 카메라 정보 출력 (C키)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'c' || e.key === 'C') {
                console.log('=== 카메라 정보 ===');
                console.log(`camera.position.set(${camera.position.x.toFixed(2)}, ${camera.position.y.toFixed(2)}, ${camera.position.z.toFixed(2)});`);
            }

            if (e.key === 'p' || e.key === 'P') {
                console.log('=== 캐릭터 위치 ===');
                console.log(`X: ${character.position.x.toFixed(2)}, Y: ${character.position.y.toFixed(2)}, Z: ${character.position.z.toFixed(2)}`);
            }
        });

        // 상호작용
        let nearbyObject = null;

        function checkNearbyObjects() {
            nearbyObject = null;
            const interactionDistance = 2;

            objects.forEach(obj => {
                const distance = character.position.distanceTo(obj.position);
                if (distance < interactionDistance) {
                    nearbyObject = obj;
                }
            });

            const interactionUI = document.getElementById('interaction-ui');
            if (interactionUI) {
                if (nearbyObject) {
                    interactionUI.style.display = 'block';
                } else {
                    interactionUI.style.display = 'none';
                }
            }
        }

        // E키 상호작용 & F키 앉기
        document.addEventListener('keydown', (e) => {
            if ((e.key === 'e' || e.key === 'E') && nearbyObject) {
                showDialog(nearbyObject.userData.name, nearbyObject.userData.content);
            }

            if (e.key === 'Escape') {
                closeDialog();
            }

            // G키로 집사 인사 모션 테스트
            if (e.key === 'g' || e.key === 'G') {
                playButlerBow();
                return;
            }

            // H키로 달리기 애니메이션 테스트
            if (e.key === 'h' || e.key === 'H') {
                console.log('H키 - 달리기 애니메이션 테스트');

                // 기존 애니메이션 중지
                if (currentGsapTimeline) {
                    currentGsapTimeline.kill();
                    currentGsapTimeline = null;
                }

                // 이동 중지
                isMoving = false;

                // 달리기 애니메이션 시작
                currentGsapTimeline = gsap.timeline();

                // 팔다리 초기화
                leftLegGroup.rotation.x = 0;
                rightLegGroup.rotation.x = 0;
                leftCalfGroup.rotation.x = 0;
                rightCalfGroup.rotation.x = 0;
                leftArmGroup.rotation.x = 0;
                rightArmGroup.rotation.x = 0;

                // 왼쪽 다리 (앞 -> 뒤 -> 앞 사이클)
                currentGsapTimeline.to(leftLegGroup.rotation, {
                    x: -0.7,  // 앞으로
                    duration: 0.15,
                    ease: "sine.inOut"
                });
                currentGsapTimeline.to(leftLegGroup.rotation, {
                    x: 0.7,  // 뒤로
                    duration: 0.15,
                    ease: "sine.inOut",
                    repeat: -1,
                    yoyo: true
                });

                // 왼쪽 종아리 (앞으로 갈 때 펴짐, 뒤로 갈 때 굽힘)
                currentGsapTimeline.to(leftCalfGroup.rotation, {
                    x: 0.1,  // 살짝 펴짐
                    duration: 0.15,
                    ease: "sine.inOut"
                }, "<-0.15");
                currentGsapTimeline.to(leftCalfGroup.rotation, {
                    x: 0.9,  // 뒤로 갈 때 굽힘
                    duration: 0.15,
                    ease: "sine.inOut",
                    repeat: -1,
                    yoyo: true
                });

                // 오른쪽 다리 (뒤 -> 앞 -> 뒤 사이클, 왼발 반대)
                currentGsapTimeline.to(rightLegGroup.rotation, {
                    x: 0.7,  // 뒤로
                    duration: 0.15,
                    ease: "sine.inOut"
                }, "<-0.15");
                currentGsapTimeline.to(rightLegGroup.rotation, {
                    x: -0.7,  // 앞으로
                    duration: 0.15,
                    ease: "sine.inOut",
                    repeat: -1,
                    yoyo: true
                });

                // 오른쪽 종아리
                currentGsapTimeline.to(rightCalfGroup.rotation, {
                    x: 0.9,  // 뒤로 있을 때 굽힘
                    duration: 0.15,
                    ease: "sine.inOut"
                }, "<-0.15");
                currentGsapTimeline.to(rightCalfGroup.rotation, {
                    x: 0.1,  // 앞으로 갈 때 펴짐
                    duration: 0.15,
                    ease: "sine.inOut",
                    repeat: -1,
                    yoyo: true
                });

                // 오른쪽 팔 (왼쪽 다리와 반대)
                currentGsapTimeline.to(rightArmGroup.rotation, {
                    x: 0.5,  // 뒤로
                    duration: 0.15,
                    ease: "sine.inOut"
                }, "<-0.15");
                currentGsapTimeline.to(rightArmGroup.rotation, {
                    x: -0.5,  // 앞으로
                    duration: 0.15,
                    ease: "sine.inOut",
                    repeat: -1,
                    yoyo: true
                });

                // 왼쪽 팔 (오른쪽 다리와 반대)
                currentGsapTimeline.to(leftArmGroup.rotation, {
                    x: -0.5,  // 앞으로
                    duration: 0.15,
                    ease: "sine.inOut"
                }, "<-0.15");
                currentGsapTimeline.to(leftArmGroup.rotation, {
                    x: 0.5,  // 뒤로
                    duration: 0.15,
                    ease: "sine.inOut",
                    repeat: -1,
                    yoyo: true
                });

                // 상체 흔들림
                currentGsapTimeline.to(body.rotation, {
                    x: 0.05,
                    duration: 0.15,
                    ease: "sine.inOut",
                    repeat: -1,
                    yoyo: true
                }, "<-0.15");
            }

            // L키로 카메라 정보 출력
            if (e.key === 'l' || e.key === 'L') {
                console.log('=== 카메라 정보 ===');
                console.log('카메라 위치:', {
                    x: camera.position.x.toFixed(2),
                    y: camera.position.y.toFixed(2),
                    z: camera.position.z.toFixed(2)
                });
                console.log('카메라 각도:', {
                    theta: cameraAngle.theta.toFixed(3),
                    phi: cameraAngle.phi.toFixed(3),
                    'theta(도)': (cameraAngle.theta * 180 / Math.PI).toFixed(1) + '°',
                    'phi(도)': (cameraAngle.phi * 180 / Math.PI).toFixed(1) + '°'
                });
                console.log('카메라 거리:', cameraDistance.toFixed(2));
                console.log('캐릭터 위치:', {
                    x: character.position.x.toFixed(2),
                    y: character.position.y.toFixed(2),
                    z: character.position.z.toFixed(2)
                });
                console.log('캐릭터 회전:', {
                    y: character.rotation.y.toFixed(3),
                    'y(도)': (character.rotation.y * 180 / Math.PI).toFixed(1) + '°'
                });
                console.log('==================');
            }

            // F키로 가까운 오브젝트 상호작용 (리팩토링된 버전)
            if (e.key === 'f' || e.key === 'F') {
                handleFKeyInteraction();
            }
        });

        // 앉기 애니메이션 함수
        function startSittingAnimation() {
            currentGsapTimeline = gsap.timeline();

            // 먼저 걷기 애니메이션 완전히 정지
            isMoving = false;
            leftLegGroup.rotation.x = 0;
            rightLegGroup.rotation.x = 0;
            leftArmGroup.rotation.x = 0;
            rightArmGroup.rotation.x = 0;

            // 쇼파 중앙에 이미 가까이 있는지 체크
            const distanceToCenter = character.position.distanceTo(sofaCenterPosition);
            const isAlreadyAtCenter = distanceToCenter < 0.3;

            if (!isAlreadyAtCenter) {
                // 1. 위치 이동과 회전 (0.8초) - 쇼파 중앙으로, 정면 향하기
                currentGsapTimeline.to(character.position, {
                    x: sofaCenterPosition.x,
                    y: sofaCenterPosition.y,
                    z: sofaCenterPosition.z,
                    duration: 0.8,
                    ease: "power2.inOut",
                    overwrite: "auto"
                });
                currentGsapTimeline.to(character.rotation, {
                    y: Math.PI / 2, // 정면(X=10 방향) 바라보기
                    duration: 0.8,
                    ease: "power2.inOut"
                }, "<"); // 동시에 시작
            } else {
                // 이미 중앙에 있으면 회전만 (높이는 이미 맞음)
                currentGsapTimeline.to(character.rotation, {
                    y: Math.PI / 2, // 정면 향하기
                    duration: 0.3,
                    ease: "power2.inOut"
                });
            }

            // 2. 양쪽 다리 올리기 (0.6초, 약간 지연) - 초기 자세와 동일 (천천히)
            // 왼쪽 다리
            currentGsapTimeline.to(leftLegGroup.rotation, {
                x: -Math.PI / 3.2,
                z: -Math.PI / 30,
                duration: 0.6,
                ease: "back.out(1.2)"
            }, "-=0.3");
            currentGsapTimeline.to(leftCalfGroup.rotation, {
                x: Math.PI / 2.5,
                duration: 0.6,
                ease: "power2.out"
            }, "<");

            // 오른쪽 다리
            currentGsapTimeline.to(rightLegGroup.rotation, {
                x: -Math.PI / 3.2,
                z: Math.PI / 30,
                duration: 0.6,
                ease: "back.out(1.2)"
            }, "<");
            currentGsapTimeline.to(rightCalfGroup.rotation, {
                x: Math.PI / 2.5,
                duration: 0.6,
                ease: "power2.out"
            }, "<");

            // 4. 팔 조정
            currentGsapTimeline.to([leftArmGroup.rotation, rightArmGroup.rotation], {
                x: 0,
                duration: 0.2,
                ease: "power1.out"
            }, "-=0.1");
        }

        // 일어서기 애니메이션 함수
        function startStandingAnimation() {
            currentGsapTimeline = gsap.timeline();

            // 1. 다리 내리기 시작
            currentGsapTimeline.to([leftLegGroup.rotation, rightLegGroup.rotation], {
                x: -Math.PI / 8, // 다리 내림
                duration: 0.2,
                ease: "power2.out"
            });

            currentGsapTimeline.to([leftCalfGroup.rotation, rightCalfGroup.rotation], {
                x: 0,
                duration: 0.2,
                ease: "power2.out"
            }, "<");

            // 2. 일어서면서 위치 이동 + 다리 완전히 펴기 + 정면 향하기
            currentGsapTimeline.to(character.position, {
                x: sofaFrontPosition.x, // 쇼파 정면 위치
                y: sofaFrontPosition.y,
                z: sofaFrontPosition.z, // 쇼파 정면 z축
                duration: 0.3,
                ease: "power2.out",
                overwrite: "auto"
            }, "-=0.05");

            currentGsapTimeline.to(character.rotation, {
                y: Math.PI / 2, // 정면 향하기 유지
                duration: 0.3,
                ease: "power2.out"
            }, "<");

            currentGsapTimeline.to([leftLegGroup.rotation, rightLegGroup.rotation], {
                x: 0,
                z: 0,
                duration: 0.25,
                ease: "power2.out"
            }, "<");

            // 3. 팔 원위치
            currentGsapTimeline.to([leftArmGroup.rotation, rightArmGroup.rotation], {
                x: 0,
                duration: 0.2,
                ease: "power1.out"
            }, "-=0.1");
        }

        // 오락기 플레이 애니메이션 함수
        function startArcadeAnimation() {
            currentGsapTimeline = gsap.timeline();

            // 걷기 애니메이션 완전히 정지 (모든 회전 초기화)
            isMoving = false;
            leftLegGroup.rotation.x = 0;
            leftLegGroup.rotation.z = 0;
            rightLegGroup.rotation.x = 0;
            rightLegGroup.rotation.z = 0;
            leftCalfGroup.rotation.x = 0;
            rightCalfGroup.rotation.x = 0;
            leftArmGroup.rotation.x = 0;
            leftArmGroup.rotation.z = 0;
            rightArmGroup.rotation.x = 0;
            rightArmGroup.rotation.z = 0;

            // 오락기 방향 보기 (Z축 양수 방향)
            currentGsapTimeline.to(character.rotation, {
                y: 0, // 0도 (앞쪽)
                duration: 0.3,
                ease: "power2.inOut"
            });

            // 양 팔을 앞으로 (조이스틱 잡는 자세)
            currentGsapTimeline.to(leftArmGroup.rotation, {
                x: -Math.PI / 6, // 30도 앞으로 (음수 = 앞)
                duration: 0.4,
                ease: "power2.out"
            }, "-=0.1");

            currentGsapTimeline.to(rightArmGroup.rotation, {
                x: -Math.PI / 6, // 30도 앞으로
                duration: 0.4,
                ease: "power2.out"
            }, "<");

            // 팔 움직임 루프 (게임 조작)
            currentGsapTimeline.to(leftArmGroup.rotation, {
                z: -Math.PI / 12,
                duration: 0.3,
                ease: "sine.inOut",
                repeat: -1,
                yoyo: true
            });

            currentGsapTimeline.to(rightArmGroup.rotation, {
                z: Math.PI / 12,
                duration: 0.3,
                ease: "sine.inOut",
                repeat: -1,
                yoyo: true
            }, "<");

            // 오락기 화면 변경 (게임 화면으로)
            const arcadeScreen = arcadeMachine.userData.screen;
            if (arcadeScreen) {
                arcadeScreen.material = new THREE.MeshToonMaterial({
                    color: 0x00ff00,
                    emissive: 0x00ff00,
                    emissiveIntensity: 1.0
                });
            }
        }

        // 오락기 플레이 종료 애니메이션
        function stopArcadeAnimation() {
            if (currentGsapTimeline) {
                currentGsapTimeline.kill();
                currentGsapTimeline = null;
            }

            currentGsapTimeline = gsap.timeline();

            // 팔 원위치
            currentGsapTimeline.to([leftArmGroup.rotation, rightArmGroup.rotation], {
                x: 0,
                z: 0,
                duration: 0.3,
                ease: "power2.inOut"
            });

            // 오락기 화면 원래대로 (꺼진 화면)
            const arcadeScreen = arcadeMachine.userData.screen;
            if (arcadeScreen) {
                arcadeScreen.material = new THREE.MeshToonMaterial({
                    color: 0x0a0a0a,
                    emissive: 0x00ffff,
                    emissiveIntensity: 0.6
                });
            }
        }

        // 런닝머신 달리기 애니메이션
        function startTreadmillAnimation() {
            isTreadmillAnimating = true;  // 애니메이션 시작
            currentGsapTimeline = gsap.timeline();

            // 걷기 애니메이션 완전히 정지
            isMoving = false;

            // 팔다리 초기화 및 보이기
            leftLegGroup.visible = true;
            rightLegGroup.visible = true;
            leftArmGroup.visible = true;
            rightArmGroup.visible = true;
            leftCalfGroup.visible = true;
            rightCalfGroup.visible = true;

            leftLegGroup.rotation.x = 0;
            leftLegGroup.rotation.z = 0;
            rightLegGroup.rotation.x = 0;
            rightLegGroup.rotation.z = 0;
            leftCalfGroup.rotation.x = 0;
            rightCalfGroup.rotation.x = 0;
            leftArmGroup.rotation.x = 0;
            leftArmGroup.rotation.z = 0;
            rightArmGroup.rotation.x = 0;
            rightArmGroup.rotation.z = 0;

            // 1단계: 런닝머신(Z축 음의 방향)을 바라보도록 회전
            // 현재 각도를 -π ~ π 범위로 정규화
            let currentAngle = character.rotation.y;
            let targetAngle = Math.PI;  // 180도 (런닝머신 정면)

            // 최단 경로로 회전하도록 각도 조정
            let diff = targetAngle - currentAngle;
            if (diff > Math.PI) diff -= 2 * Math.PI;
            if (diff < -Math.PI) diff += 2 * Math.PI;

            currentGsapTimeline.to(character.rotation, {
                y: currentAngle + diff,  // 최단 경로로 회전
                duration: 0.3,
                ease: "power2.out"
            });

            // 2단계: 런닝머신 위로 자연스럽게 올라가기 (G키 모션처럼 앞으로 전진)
            // 왼발 들어올리면서 앞으로 전진 (첫 계단)
            currentGsapTimeline.to(leftLegGroup.rotation, {
                x: -0.6,  // 앞으로 들기 (각도 줄임)
                duration: 0.3,
                ease: "power2.out"
            });
            currentGsapTimeline.to(leftCalfGroup.rotation, {
                x: 0.5,   // 종아리 굽히기 (각도 줄임)
                duration: 0.3,
                ease: "power2.out"
            }, "<");
            currentGsapTimeline.to(character.position, {
                y: 0.65,  // 첫 계단 높이 (이건 맞음)
                z: character.position.z - 0.15,  // 앞으로 전진
                duration: 0.3,
                ease: "power2.out"
            }, "<");

            // 왼발 착지, 오른발 들어올리면서 완전히 올라가기
            currentGsapTimeline.to(leftLegGroup.rotation, {
                x: -0.1,  // 착지 (약간 앞으로)
                duration: 0.15,
                ease: "power2.in"
            });
            currentGsapTimeline.to(leftCalfGroup.rotation, {
                x: 0,
                duration: 0.15,
                ease: "power2.in"
            }, "<");
            currentGsapTimeline.to(rightLegGroup.rotation, {
                x: -0.6,  // 앞으로 들기
                duration: 0.3,
                ease: "power2.out"
            }, "<0.1");
            currentGsapTimeline.to(rightCalfGroup.rotation, {
                x: 0.5,   // 종아리 굽히기
                duration: 0.3,
                ease: "power2.out"
            }, "<");
            currentGsapTimeline.to(character.position, {
                y: 0.75,  // 벨트 위 (높이 조정)
                z: character.position.z - 0.45,  // 3배 더 가기 (0.15 * 3)
                duration: 0.3,
                ease: "power2.out"
            }, "<");

            // 오른발 착지 후 자세 정리
            currentGsapTimeline.to(rightLegGroup.rotation, {
                x: 0,
                duration: 0.15,
                ease: "power2.in"
            });
            currentGsapTimeline.to(rightCalfGroup.rotation, {
                x: 0,
                duration: 0.15,
                ease: "power2.in"
            }, "<");
            currentGsapTimeline.to(leftLegGroup.rotation, {
                x: 0,
                duration: 0.15,
                ease: "power2.in"
            }, "<");

            // 평지에서 천천히 걸어서 중앙(뛰는 포인트)까지 이동
            currentGsapTimeline.to(character.position, {
                x: -3.5,
                z: -8.0,  // 중앙 위치
                duration: 1.2,  // 천천히 (0.6 → 1.2)
                ease: "power1.inOut",
                onUpdate: function() {
                    const progress = this.progress();
                    leftLegGroup.rotation.x = Math.sin(progress * Math.PI * 4) * 0.25;
                    rightLegGroup.rotation.x = -Math.sin(progress * Math.PI * 4) * 0.25;
                    leftArmGroup.rotation.x = -Math.sin(progress * Math.PI * 4) * 0.15;
                    rightArmGroup.rotation.x = Math.sin(progress * Math.PI * 4) * 0.15;
                },
                onComplete: () => {
                    // 도착 후 팔다리 완전 초기화
                    leftLegGroup.rotation.x = 0;
                    rightLegGroup.rotation.x = 0;
                    leftCalfGroup.rotation.x = 0;
                    rightCalfGroup.rotation.x = 0;
                    leftArmGroup.rotation.x = 0;
                    rightArmGroup.rotation.x = 0;
                    isTreadmillAnimating = false;  // 올라가기 애니메이션 완료
                }
            });

            // 달리기 모션 시작 (더 자연스러운 달리기)
            // 왼쪽 다리 (앞 -> 뒤 -> 앞 사이클)
            currentGsapTimeline.to(leftLegGroup.rotation, {
                x: -0.7,  // 앞으로
                duration: 0.15,
                ease: "sine.inOut"
            }, "+=0.1");
            currentGsapTimeline.to(leftLegGroup.rotation, {
                x: 0.7,  // 뒤로
                duration: 0.15,
                ease: "sine.inOut",
                repeat: -1,
                yoyo: true
            });

            // 왼쪽 종아리 (앞으로 갈 때 펴짐, 뒤로 갈 때 굽힘)
            currentGsapTimeline.to(leftCalfGroup.rotation, {
                x: 0.1,  // 살짝 펴짐
                duration: 0.15,
                ease: "sine.inOut"
            }, "<-0.15");
            currentGsapTimeline.to(leftCalfGroup.rotation, {
                x: 0.9,  // 뒤로 갈 때 굽힘
                duration: 0.15,
                ease: "sine.inOut",
                repeat: -1,
                yoyo: true
            });

            // 오른쪽 다리 (뒤 -> 앞 -> 뒤 사이클, 왼발 반대)
            currentGsapTimeline.to(rightLegGroup.rotation, {
                x: 0.7,  // 뒤로
                duration: 0.15,
                ease: "sine.inOut"
            }, "<-0.15");
            currentGsapTimeline.to(rightLegGroup.rotation, {
                x: -0.7,  // 앞으로
                duration: 0.15,
                ease: "sine.inOut",
                repeat: -1,
                yoyo: true
            });

            // 오른쪽 종아리
            currentGsapTimeline.to(rightCalfGroup.rotation, {
                x: 0.9,  // 뒤로 있을 때 굽힘
                duration: 0.15,
                ease: "sine.inOut"
            }, "<-0.15");
            currentGsapTimeline.to(rightCalfGroup.rotation, {
                x: 0.1,  // 앞으로 갈 때 펴짐
                duration: 0.15,
                ease: "sine.inOut",
                repeat: -1,
                yoyo: true
            });

            // 오른쪽 팔 (왼쪽 다리와 반대)
            currentGsapTimeline.to(rightArmGroup.rotation, {
                x: 0.5,  // 뒤로
                duration: 0.15,
                ease: "sine.inOut"
            }, "<-0.15");
            currentGsapTimeline.to(rightArmGroup.rotation, {
                x: -0.5,  // 앞으로
                duration: 0.15,
                ease: "sine.inOut",
                repeat: -1,
                yoyo: true
            });

            // 왼쪽 팔 (오른쪽 다리와 반대)
            currentGsapTimeline.to(leftArmGroup.rotation, {
                x: -0.5,  // 앞으로
                duration: 0.15,
                ease: "sine.inOut"
            }, "<-0.15");
            currentGsapTimeline.to(leftArmGroup.rotation, {
                x: 0.5,  // 뒤로
                duration: 0.15,
                ease: "sine.inOut",
                repeat: -1,
                yoyo: true
            });

            // 상체 흔들림
            currentGsapTimeline.to(body.rotation, {
                x: 0.05,
                duration: 0.15,
                ease: "sine.inOut",
                repeat: -1,
                yoyo: true
            }, "<-0.15");
        }

        // 런닝머신 종료 애니메이션
        function stopTreadmillAnimation() {
            isTreadmillAnimating = true;  // 내리기 애니메이션 시작

            // 모든 GSAP 애니메이션 완전히 중지
            if (currentGsapTimeline) {
                currentGsapTimeline.kill();
                currentGsapTimeline = null;
            }

            // 개별 팔다리 애니메이션도 모두 중지
            gsap.killTweensOf([
                leftLegGroup.rotation,
                rightLegGroup.rotation,
                leftCalfGroup.rotation,
                rightCalfGroup.rotation,
                leftArmGroup.rotation,
                rightArmGroup.rotation,
                body.rotation
            ]);

            currentGsapTimeline = gsap.timeline();

            // 1단계: 달리기 중단 - 팔다리 원위치
            currentGsapTimeline.to([leftArmGroup.rotation, rightArmGroup.rotation], {
                x: 0,
                duration: 0.2,
                ease: "power2.inOut"
            });

            currentGsapTimeline.to([leftLegGroup.rotation, rightLegGroup.rotation], {
                x: 0,
                duration: 0.2,
                ease: "power2.inOut"
            }, "<");

            currentGsapTimeline.to([leftCalfGroup.rotation, rightCalfGroup.rotation], {
                x: 0,
                duration: 0.2,
                ease: "power2.inOut"
            }, "<");

            currentGsapTimeline.to(body.rotation, {
                x: 0,
                duration: 0.2,
                ease: "power2.inOut"
            }, "<");

            // 2단계: 천천히 뒤로 돌기 (180도 → 0도)
            // 현재 각도에서 최단 경로로 0도로 회전
            currentGsapTimeline.to(character.rotation, {
                y: 0,  // 정면으로 (0도)
                duration: 0.5,
                ease: "power2.inOut"
            });

            // 3단계: 런닝머신 위에서 앞으로 조금 걸어가기 (평지 걷기)
            // 왼발 한 걸음
            currentGsapTimeline.to(leftLegGroup.rotation, {
                x: -0.4,
                duration: 0.2,
                ease: "sine.inOut"
            });
            currentGsapTimeline.to(leftCalfGroup.rotation, {
                x: 0.2,
                duration: 0.2,
                ease: "sine.inOut"
            }, "<");
            currentGsapTimeline.to(rightLegGroup.rotation, {
                x: 0.4,
                duration: 0.2,
                ease: "sine.inOut"
            }, "<");
            currentGsapTimeline.to(character.position, {
                z: -7.625,  // 앞으로 살짝 (75%: -8 + 0.375)
                duration: 0.2,
                ease: "sine.inOut"
            }, "<");

            // 오른발 한 걸음
            currentGsapTimeline.to(leftLegGroup.rotation, {
                x: 0.4,
                duration: 0.2,
                ease: "sine.inOut"
            });
            currentGsapTimeline.to(leftCalfGroup.rotation, {
                x: 0,
                duration: 0.2,
                ease: "sine.inOut"
            }, "<");
            currentGsapTimeline.to(rightLegGroup.rotation, {
                x: -0.4,
                duration: 0.2,
                ease: "sine.inOut"
            }, "<");
            currentGsapTimeline.to(rightCalfGroup.rotation, {
                x: 0.2,
                duration: 0.2,
                ease: "sine.inOut"
            }, "<");
            currentGsapTimeline.to(character.position, {
                z: -7.25,  // 앞으로 조금 더 (75%: -8 + 0.75)
                duration: 0.2,
                ease: "sine.inOut"
            }, "<");

            // 다리 정리
            currentGsapTimeline.to([leftLegGroup.rotation, rightLegGroup.rotation], {
                x: 0,
                duration: 0.15,
                ease: "sine.inOut"
            });
            currentGsapTimeline.to([leftCalfGroup.rotation, rightCalfGroup.rotation], {
                x: 0,
                duration: 0.15,
                ease: "sine.inOut"
            }, "<");

            // 4단계: 점프 준비 (무릎 살짝 굽히기)
            currentGsapTimeline.to([leftLegGroup.rotation, rightLegGroup.rotation], {
                x: 0.3,
                duration: 0.3,
                ease: "power2.in"
            });
            currentGsapTimeline.to([leftCalfGroup.rotation, rightCalfGroup.rotation], {
                x: 0.4,
                duration: 0.3,
                ease: "power2.in"
            }, "<");
            currentGsapTimeline.to(character.position, {
                y: 0.65,  // 살짝 낮아지기
                duration: 0.3,
                ease: "power2.in"
            }, "<");

            // 5단계: 점프! (천천히 뛰어내리기)
            currentGsapTimeline.to([leftLegGroup.rotation, rightLegGroup.rotation], {
                x: -0.2,  // 다리 펴기
                duration: 0.6,  // 0.3 → 0.6 (2배 느리게)
                ease: "power1.out"
            });
            currentGsapTimeline.to([leftCalfGroup.rotation, rightCalfGroup.rotation], {
                x: 0.1,
                duration: 0.6,
                ease: "power1.out"
            }, "<");
            currentGsapTimeline.to(character.position, {
                y: 1.1,  // 위로 점프
                z: -5.5,  // 뒤로 (런닝머신 앞쪽으로 뛰어내리기)
                duration: 0.6,
                ease: "power1.out"
            }, "<");

            // 6단계: 착지 (천천히)
            currentGsapTimeline.to([leftLegGroup.rotation, rightLegGroup.rotation], {
                x: 0.4,  // 무릎 굽혀서 착지
                duration: 0.4,  // 0.2 → 0.4
                ease: "power2.in"
            });
            currentGsapTimeline.to([leftCalfGroup.rotation, rightCalfGroup.rotation], {
                x: 0.5,
                duration: 0.4,
                ease: "power2.in"
            }, "<");
            currentGsapTimeline.to(character.position, {
                y: 0.5,  // 지면으로
                duration: 0.4,
                ease: "power2.in"
            }, "<");

            // 7단계: 착지 후 정상 자세
            currentGsapTimeline.to([leftLegGroup.rotation, rightLegGroup.rotation], {
                x: 0,
                duration: 0.3,
                ease: "power2.out"
            });
            currentGsapTimeline.to([leftCalfGroup.rotation, rightCalfGroup.rotation], {
                x: 0,
                duration: 0.3,
                ease: "power2.out",
                onComplete: () => {
                    isTreadmillAnimating = false;  // 내리기 애니메이션 완료
                }
            }, "<");
        }

        // 다이얼로그
        function showDialog(title, content) {
            const dialogTitle = document.getElementById('dialogTitle');
            const dialogContent = document.getElementById('dialogContent');
            const dialogOverlay = document.getElementById('dialogOverlay');

            if (dialogTitle && dialogContent && dialogOverlay) {
                dialogTitle.innerHTML = title;
                dialogContent.innerHTML = content;
                dialogOverlay.classList.add('active');
            }
        }

        function closeDialog() {
            const dialogOverlay = document.getElementById('dialogOverlay');
            if (dialogOverlay) {
                dialogOverlay.classList.remove('active');
            }
        }

        // 말풍선 표시/숨기기
        function showSpeechBubble() {
            // 기존 말풍선이 있으면 제거
            const existingBubble = document.getElementById('speech-bubble');
            if (existingBubble) {
                existingBubble.remove();
            }

            // 말풍선 생성
            const bubble = document.createElement('div');
            bubble.id = 'speech-bubble';
            bubble.style.cssText = `
                position: fixed;
                background: white;
                color: #333;
                padding: 20px 25px;
                border-radius: 20px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                z-index: 1000;
                font-family: 'Noto Sans KR', sans-serif;
                font-size: 16px;
                font-weight: 500;
                pointer-events: auto;
                opacity: 0;
                transform: scale(0.8);
                transition: all 0.3s ease-out;
            `;

            bubble.innerHTML = `
                <div style="
                    position: absolute;
                    left: -15px;
                    bottom: 30px;
                    width: 0;
                    height: 0;
                    border-top: 15px solid transparent;
                    border-right: 20px solid white;
                    border-bottom: 15px solid transparent;
                "></div>
                <div style="margin-bottom: 15px; text-align: center; font-size: 18px; font-weight: 600; color: #2a2a2a;">
                    무엇을 도와드릴까요? 😊
                </div>
                <div style="display: flex; gap: 10px; justify-content: center;">
                    <button id="btn-profile" style="
                        padding: 12px 24px;
                        background: #2a2a2a;
                        color: white;
                        border: none;
                        border-radius: 12px;
                        cursor: pointer;
                        font-size: 15px;
                        font-weight: 600;
                        transition: all 0.2s;
                        font-family: 'Noto Sans KR', sans-serif;
                    ">📋 프로필</button>
                    <button id="btn-blog" style="
                        padding: 12px 24px;
                        background: #2a2a2a;
                        color: white;
                        border: none;
                        border-radius: 12px;
                        cursor: pointer;
                        font-size: 15px;
                        font-weight: 600;
                        transition: all 0.2s;
                        font-family: 'Noto Sans KR', sans-serif;
                    ">✍️ 블로그</button>
                </div>
            `;

            document.body.appendChild(bubble);

            // 버튼 호버 효과
            const buttons = bubble.querySelectorAll('button');
            buttons.forEach(btn => {
                btn.addEventListener('mouseenter', () => {
                    btn.style.transform = 'translateY(-2px)';
                    btn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                    btn.style.background = '#1a1a1a';
                });
                btn.addEventListener('mouseleave', () => {
                    btn.style.transform = 'translateY(0)';
                    btn.style.boxShadow = 'none';
                    btn.style.background = '#2a2a2a';
                });
            });

            // 버튼 클릭 이벤트
            document.getElementById('btn-profile').addEventListener('click', () => {
                console.log('프로필 선택됨');
                hideSpeechBubble();
                // 리모콘 버튼 누르는 모션 후 CMD 창 열기
                playRemoteControlAction(() => {
                    openCmdWindow();
                });
            });

            document.getElementById('btn-blog').addEventListener('click', () => {
                console.log('블로그 선택됨');
                hideSpeechBubble();
                // 블로그 페이지로 이동
                window.location.href = 'index_blog.html';
            });

            // 말풍선 위치 업데이트
            updateSpeechBubblePosition();

            // 페이드인 애니메이션
            setTimeout(() => {
                bubble.style.opacity = '1';
                bubble.style.transform = 'scale(1)';
            }, 100);
        }

        function hideSpeechBubble() {
            const bubble = document.getElementById('speech-bubble');
            if (bubble) {
                bubble.style.opacity = '0';
                bubble.style.transform = 'scale(0.8)';
                setTimeout(() => bubble.remove(), 300);
            }
        }

        function updateSpeechBubblePosition() {
            const bubble = document.getElementById('speech-bubble');
            if (!bubble) return;

            // 캐릭터 머리 위치 (모자 위)
            const hatPosition = new THREE.Vector3(
                character.position.x,
                character.position.y + 1.8, // 모자 위
                character.position.z
            );

            // 3D 좌표를 화면 좌표로 변환
            const screenPosition = hatPosition.clone().project(camera);
            const x = (screenPosition.x * 0.5 + 0.5) * window.innerWidth;
            const y = (screenPosition.y * -0.5 + 0.5) * window.innerHeight;

            // 말풍선 위치 설정 (모자 옆으로 오프셋)
            bubble.style.left = `${x + 80}px`;
            bubble.style.top = `${y - 80}px`;
        }

        // ========================================
        // 프로필 데이터
        // ========================================
        const profileData = {
            awards: [
                {
                    title: '🏆 Defcon Adversary Village CTF 3rd',
                    date: '2024',
                    desc: 'Defcon 32 Adversary Village CTF 대회 3위 입상\n세계 최대 보안 컨퍼런스 Defcon에서 개최된 CTF 경진대회\nRed Team 시나리오 기반 실전 해킹 챌린지'
                }
            ],
            certificates: [
                {
                    title: '🔐 정보보안기사',
                    date: '2023.08',
                    desc: '한국산업인력공단\n시스템/네트워크/애플리케이션 보안 전문가 자격증\n정보보호 관리체계, 암호학, 접근제어 등 이론 및 실무'
                },
                {
                    title: '🔒 CPPG (Certified Privacy Protection General)',
                    date: '2023.06',
                    desc: '한국인터넷진흥원(KISA)\n개인정보보호 전문가 자격증\nGDPR, PIPA 등 개인정보보호 법령 및 기술적 보호조치'
                },
                {
                    title: '💻 정보처리기사',
                    date: '2022.11',
                    desc: '한국산업인력공단\n소프트웨어 개발 및 정보시스템 전문가 자격증\n프로그래밍, 데이터베이스, 보안 등 종합 IT 역량'
                },
                {
                    title: '☁️ AWS Certified Security - Specialty',
                    date: '2024.02',
                    desc: 'Amazon Web Services\nAWS 클라우드 보안 전문가 자격증\nIAM, KMS, CloudTrail, GuardDuty 등 AWS 보안 서비스 운영'
                }
            ],
            career: [
                {
                    title: '🛡️ 시큐아이 (SecuI) - 보안컨설턴트',
                    date: '2023.09 ~ 현재',
                    desc: '모의해킹 및 취약점 진단 수행\nWeb Application & Mobile App 보안 점검\n침투 테스트 및 보안 컨설팅\nOWASP Top 10 기반 취약점 분석 및 보고서 작성'
                }
            ]
        };

        // CMD 창 열기/닫기
        function openCmdWindow() {
            const cmdOverlay = document.getElementById('cmdOverlay');
            cmdOverlay.classList.add('active');

            // 초기 카테고리 표시 (수상이력)
            showProfileCategory('awards');

            // 메뉴 버튼 이벤트 설정
            const menuButtons = document.querySelectorAll('.cmd-menu-btn');
            menuButtons.forEach(btn => {
                btn.addEventListener('click', function() {
                    // 모든 버튼 비활성화
                    menuButtons.forEach(b => b.classList.remove('active'));
                    // 클릭한 버튼 활성화
                    this.classList.add('active');
                    // 해당 카테고리 표시
                    const category = this.getAttribute('data-category');
                    showProfileCategory(category);
                });
            });
        }

        function closeCmdWindow() {
            const cmdOverlay = document.getElementById('cmdOverlay');
            cmdOverlay.classList.remove('active');
        }

        function showProfileCategory(category) {
            const cmdContent = document.getElementById('cmdContent');
            const data = profileData[category];

            if (!data) {
                cmdContent.innerHTML = '<div class="cmd-loading">데이터를 찾을 수 없습니다.</div>';
                return;
            }

            // 카테고리별 제목
            const titles = {
                awards: '🏆 수상이력',
                certificates: '📜 자격증',
                career: '💼 경력사항'
            };

            // 로딩 화면 표시
            cmdContent.innerHTML = '<div class="cmd-loading"><span class="cmd-cursor">█</span> Loading data...</div>';

            setTimeout(() => {
                // 제목 먼저 표시
                cmdContent.innerHTML = `<div class="cmd-section-title" style="opacity: 0;">${titles[category]}</div>`;

                // 제목 페이드인
                const titleEl = cmdContent.querySelector('.cmd-section-title');
                gsap.to(titleEl, {
                    opacity: 1,
                    duration: 0.5,
                    ease: "power2.out"
                });

                // 아이템들을 순차적으로 추가
                data.forEach((item, index) => {
                    setTimeout(() => {
                        const itemDiv = document.createElement('div');
                        itemDiv.className = 'cmd-item';
                        itemDiv.style.opacity = '0';
                        itemDiv.style.transform = 'translateY(20px)';
                        itemDiv.innerHTML = `
                            <div class="cmd-item-title">${item.title}</div>
                            <div class="cmd-item-date">📅 ${item.date}</div>
                            <div class="cmd-item-desc">${item.desc.replace(/\n/g, '<br>')}</div>
                        `;
                        cmdContent.appendChild(itemDiv);

                        // 페이드인 + 슬라이드 업 애니메이션
                        gsap.to(itemDiv, {
                            opacity: 1,
                            y: 0,
                            duration: 0.5,
                            ease: "power2.out"
                        });
                    }, 200 + (index * 150)); // 각 아이템마다 150ms 딜레이
                });
            }, 500);
        }

        // 리모콘 작동 애니메이션 (왼팔로 리모콘 버튼 누르는 모션)
        function playRemoteControlAction(callback) {
            if (isMoving) return;

            console.log('=== 리모콘 작동 모션 시작 ===');

            const remoteTimeline = gsap.timeline({
                onComplete: () => {
                    console.log('=== 리모콘 작동 완료 ===');
                    if (callback) callback();
                }
            });

            // 1. 왼팔을 앞으로 뻗기 (리모콘 버튼 누르는 동작)
            remoteTimeline.to(leftArmGroup.rotation, {
                x: Math.PI / 4, // 45도 앞으로
                duration: 0.3,
                ease: "power2.out"
            });

            // 2. 잠깐 멈추기 (버튼 누르는 순간)
            remoteTimeline.to({}, { duration: 0.2 });

            // 3. 팔 원위치
            remoteTimeline.to(leftArmGroup.rotation, {
                x: 0,
                duration: 0.3,
                ease: "power2.in"
            });
        }

        // 걷기 애니메이션 변수
        let walkCycle = 0;
        const walkSpeed = 0.1;

        // 애니메이션 루프
        function animate() {
            requestAnimationFrame(animate);

            // 캐릭터 이동
            if (isMoving && targetPosition) {
                const direction = new THREE.Vector3()
                    .subVectors(targetPosition, character.position)
                    .normalize();

                const distance = character.position.distanceTo(targetPosition);

                if (distance > 0.1) {
                    // 새 위치 계산
                    const newPosition = character.position.clone().add(direction.multiplyScalar(moveSpeed));

                    // 충돌 체크 - 충돌이 없을 때만 이동
                    if (!checkCollision(newPosition)) {
                        character.position.copy(newPosition);

                        // 캐릭터 회전 (이동 방향)
                        const angle = Math.atan2(direction.x, direction.z);
                        character.rotation.y = angle;

                        // 걷기 애니메이션 (2관절 다리) - 충돌 없을 때만
                        walkCycle += walkSpeed;
                        const limbs = character.userData.limbs;

                        // 허벅지 흔들기
                        limbs.leftLeg.rotation.x = Math.sin(walkCycle) * 0.5;
                        limbs.rightLeg.rotation.x = Math.sin(walkCycle + Math.PI) * 0.5;

                        // 종아리 자연스럽게 구부리기 (걸을 때)
                        limbs.leftCalf.rotation.x = Math.max(0, -Math.sin(walkCycle) * 0.8);
                        limbs.rightCalf.rotation.x = Math.max(0, -Math.sin(walkCycle + Math.PI) * 0.8);

                        // 팔 흔들기 (다리 반대로)
                        limbs.leftArm.rotation.x = Math.sin(walkCycle + Math.PI) * 0.4;
                        limbs.rightArm.rotation.x = Math.sin(walkCycle) * 0.4;
                    } else {
                        // 충돌 시 이동 중단 + 다리 원위치
                        console.log('충돌 감지! 이동 중단');
                        isMoving = false;
                        targetPosition = null;

                        // 웨이포인트 경로도 취소
                        pathWaypoints = [];
                        currentWaypointIndex = 0;
                        isWalkingToSofa = false;
                        isWalkingToStand = false;
                        isWalkingToArcade = false;
                        isWalkingToTreadmill = false;

                        // 다리와 팔 원위치
                        const limbs = character.userData.limbs;
                        limbs.leftLeg.rotation.x = 0;
                        limbs.rightLeg.rotation.x = 0;
                        limbs.leftLeg.rotation.z = 0;
                        limbs.rightLeg.rotation.z = 0;
                        limbs.leftCalf.rotation.x = 0;
                        limbs.rightCalf.rotation.x = 0;
                        limbs.leftArm.rotation.x = 0;
                        limbs.rightArm.rotation.x = 0;
                    }

                } else {
                    isMoving = false;
                    targetPosition = null;

                    // 목적지 도착 시 팔다리 원위치
                    const limbs = character.userData.limbs;
                    limbs.leftLeg.rotation.x = 0;
                    limbs.rightLeg.rotation.x = 0;
                    limbs.leftLeg.rotation.z = 0;
                    limbs.rightLeg.rotation.z = 0;
                    limbs.leftCalf.rotation.x = 0;
                    limbs.rightCalf.rotation.x = 0;
                    limbs.leftArm.rotation.x = 0;
                    limbs.rightArm.rotation.x = 0;
                }
            }

            // 쇼파로 걸어가는 중이면 도착 체크
            if (isWalkingToSofa && !isMoving) {
                // 다음 웨이포인트로 이동
                currentWaypointIndex++;
                console.log(`웨이포인트 ${currentWaypointIndex}/${pathWaypoints.length} 도착`);
                console.log(`현재 위치: (${character.position.x.toFixed(2)}, ${character.position.z.toFixed(2)})`);

                if (currentWaypointIndex < pathWaypoints.length) {
                    // 다음 웨이포인트로 계속 이동 (경로는 이미 계산됨, 그대로 따라가기)
                    targetPosition = pathWaypoints[currentWaypointIndex].clone();
                    isMoving = true;
                    console.log(`다음 목표: (${targetPosition.x.toFixed(2)}, ${targetPosition.z.toFixed(2)})`);
                } else {
                    // 모든 웨이포인트 도착 - 앉기 시작
                    console.log('모든 웨이포인트 완료 - 앉기 시작');
                    isWalkingToSofa = false;
                    pathWaypoints = [];
                    currentWaypointIndex = 0;
                    isSitting = true;
                    startSittingAnimation();
                }
            }

            // 일어서기 위해 걸어가는 중이면 도착 체크
            if (isWalkingToStand && !isMoving) {
                // 도착했으면 일어서기 시작
                isWalkingToStand = false;
                isSitting = false;
                startStandingAnimation();
            }

            // 오락기로 걸어가는 중이면 도착 체크
            if (isWalkingToArcade && !isMoving) {
                // 다음 웨이포인트로 이동
                currentWaypointIndex++;
                console.log(`웨이포인트 ${currentWaypointIndex}/${pathWaypoints.length} 도착`);
                console.log(`현재 위치: (${character.position.x.toFixed(2)}, ${character.position.z.toFixed(2)})`);

                if (currentWaypointIndex < pathWaypoints.length) {
                    // 다음 웨이포인트로 계속 이동 (경로는 이미 계산됨, 그대로 따라가기)
                    targetPosition = pathWaypoints[currentWaypointIndex].clone();
                    isMoving = true;
                    console.log(`다음 목표: (${targetPosition.x.toFixed(2)}, ${targetPosition.z.toFixed(2)})`);
                } else {
                    // 모든 웨이포인트 도착 - 플레이 시작
                    console.log('모든 웨이포인트 완료 - 오락기 플레이 시작');
                    isWalkingToArcade = false;
                    pathWaypoints = [];
                    currentWaypointIndex = 0;
                    isPlayingArcade = true;
                    startArcadeAnimation();
                }
            }

            // 런닝머신으로 걸어가는 중이면 도착 체크
            if (isWalkingToTreadmill && !isMoving) {
                currentWaypointIndex++;
                console.log(`웨이포인트 ${currentWaypointIndex}/${pathWaypoints.length} 도착`);

                if (currentWaypointIndex < pathWaypoints.length) {
                    targetPosition = pathWaypoints[currentWaypointIndex].clone();
                    isMoving = true;
                } else {
                    // 모든 웨이포인트 도착 - 달리기 시작
                    console.log('모든 웨이포인트 완료 - 런닝머신 시작');
                    isWalkingToTreadmill = false;
                    pathWaypoints = [];
                    currentWaypointIndex = 0;
                    isRunningTreadmill = true;
                    startTreadmillAnimation();
                }
            }

            checkNearbyObjects();
            updateSpeechBubblePosition(); // 말풍선 위치 업데이트
            renderer.render(scene, camera);
        }

        // 반응형
        window.addEventListener('resize', () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        });

        // 상태 관리
        let sceneState = 'INIT'; // INIT → ROOM_INTRO → REMOTE_READY → (SELECT_PROFILE/SELECT_BLOG)

        // 인트로 시퀀스: 전체 부팅 연출
        function startIntroSequence() {
            console.log('=== 인트로 시퀀스 시작 ===');

            // 사용자 입력 차단
            isMoving = true;

            sceneState = 'ROOM_INTRO';

            // 초기 상태: 모든 조명 어둡게
            const allLights = scene.children.filter(obj => obj.isLight);
            allLights.forEach(light => {
                if (light.userData && !light.userData.isAmbient) {
                    light.intensity = 0;
                }
            });
            console.log('[0초] 조명 어둡게 설정 완료');

            // 캐릭터 초기 위치: 쇼파 앞에 서있는 상태
            character.position.copy(sofaFrontPosition);
            character.rotation.y = Math.PI / 2; // +90도 (카메라 정면 향함)
            isSitting = false; // 서있는 상태
            console.log('[0초] 캐릭터 서있는 상태로 시작 (카메라 정면):', character.position);

            // 서있는 자세 (모든 관절 초기화)
            leftLegGroup.rotation.set(0, 0, 0);
            rightLegGroup.rotation.set(0, 0, 0);
            leftCalfGroup.rotation.set(0, 0, 0);
            rightCalfGroup.rotation.set(0, 0, 0);
            leftArmGroup.rotation.set(0, 0, 0);
            rightArmGroup.rotation.set(0, 0, 0);
            bodyGroup.rotation.set(0, 0, 0);
            console.log('[0초] 서있는 자세 적용 완료');

            // 카메라 초기 설정 - 줌인된 상태로 시작 (서커스 스포트라이트 효과)
            cameraDistance = 8; // 처음부터 줌인된 상태
            cameraAngle.theta = 0; // 0도 (정면)
            cameraAngle.phi = Math.PI / 2.5; // 72도 (얼굴이 보이는 각도)
            updateCameraPosition();
            console.log('[0초] 카메라 줌인 상태로 시작 - 거리:', cameraDistance);

            // GSAP 타임라인
            const introTimeline = gsap.timeline();

            // 1. 검은 화면에서 페이드인 (0-2초)
            introTimeline.call(() => {
                console.log('[0초] 서커스 스포트라이트 효과 시작');
                // 검은 오버레이 생성
                const fadeOverlay = document.createElement('div');
                fadeOverlay.id = 'fade-overlay';
                fadeOverlay.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: #000;
                    z-index: 10000;
                    transition: opacity 2s ease-out;
                `;
                document.body.appendChild(fadeOverlay);

                // 2초 후 페이드아웃
                setTimeout(() => {
                    fadeOverlay.style.opacity = '0';
                    setTimeout(() => fadeOverlay.remove(), 2000);
                }, 100);
            });

            // 2. 조명 점등 (0-2초, 페이드인과 동시)
            introTimeline.call(() => {
                console.log('[0초] 스포트라이트 조명 점등');
                lightsSequence();
            }, null, 0);

            // 3. 집사 인사 (2초 후)
            introTimeline.call(() => {
                console.log('[2초] 집사 인사 시작');
                playIntroButlerBow();
            }, null, 2);
        }

        // 부팅 화면
        function showBootScreen() {
            const bootScreen = document.createElement('div');
            bootScreen.id = 'boot-screen';
            bootScreen.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: #000;
                color: #00ff00;
                font-family: 'Courier New', monospace;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                font-size: 1.2rem;
            `;
            bootScreen.innerHTML = `
                <div>⚡ SECURITY ROOM SYSTEM</div>
                <div style="margin-top: 10px;">Booting...</div>
                <div style="margin-top: 20px; font-size: 2rem;">█</div>
            `;
            document.body.appendChild(bootScreen);

            // 1초 후 제거
            setTimeout(() => {
                bootScreen.style.transition = 'opacity 0.5s';
                bootScreen.style.opacity = '0';
                setTimeout(() => bootScreen.remove(), 500);
            }, 1000);
        }

        // 조명 순차 점등
        function lightsSequence() {
            const lights = scene.children.filter(obj =>
                obj.isLight && obj.userData && !obj.userData.isAmbient
            );

            lights.forEach((light, index) => {
                setTimeout(() => {
                    gsap.to(light, {
                        intensity: light.userData.originalIntensity || 1,
                        duration: 0.5,
                        ease: 'power2.out'
                    });
                }, index * 300); // 0.3초 간격으로 점등
            });
        }

        // 쇼파에서 내려오기 및 집사 인사 시퀀스
        function startGetOffSofa() {
            console.log('=== 쇼파에서 내려오기 시퀀스 시작 ===');

            const getOffTimeline = gsap.timeline({
                onComplete: () => {
                    isMoving = false;
                    console.log('=== 인사 완료 ===');
                }
            });

            // 1. F키 일어서기 애니메이션 사용 (다리 내리기)
            getOffTimeline.to([leftLegGroup.rotation, rightLegGroup.rotation], {
                x: -Math.PI / 8,
                duration: 0.2,
                ease: "power2.out",
                onStart: () => {
                    console.log('[내려오기] F키 애니메이션 시작');
                }
            });

            getOffTimeline.to([leftCalfGroup.rotation, rightCalfGroup.rotation], {
                x: 0,
                duration: 0.2,
                ease: "power2.out"
            }, "<");

            // 2. 쇼파 앞으로 이동 + 다리 펴기
            getOffTimeline.to(character.position, {
                x: sofaFrontPosition.x,
                y: sofaFrontPosition.y,
                z: sofaFrontPosition.z,
                duration: 0.3,
                ease: "power2.out",
                overwrite: "auto",
                onStart: () => {
                    isSitting = false;
                }
            }, "-=0.05");

            getOffTimeline.to(character.rotation, {
                y: Math.PI / 2, // 정면 향하기
                duration: 0.3,
                ease: "power2.out"
            }, "<");

            getOffTimeline.to([leftLegGroup.rotation, rightLegGroup.rotation], {
                x: 0,
                z: 0,
                duration: 0.25,
                ease: "power2.out"
            }, "<");

            getOffTimeline.to([leftArmGroup.rotation, rightArmGroup.rotation], {
                x: 0,
                duration: 0.2,
                ease: "power1.out"
            }, "-=0.1");

            // 3. 집사 인사 (G키 테스트 모션과 동일)
            getOffTimeline.to(bodyGroup.rotation, {
                x: Math.PI * 0.4, // 72도 (G키와 동일)
                duration: 1.0,
                ease: "power2.inOut",
                onStart: () => {
                    console.log('[인사] 집사 인사 시작');
                }
            }, "+=0.3");

            // 왼팔 - 가슴에 올리기 (G키와 동일)
            getOffTimeline.to(leftArmGroup.rotation, {
                x: Math.PI / 3, // 60도 앞으로
                z: Math.PI / 6, // 30도 안쪽으로
                duration: 1.0,
                ease: "power2.inOut"
            }, "<");

            // 오른팔 - 뒤로 넘기기 (G키와 동일)
            getOffTimeline.to(rightArmGroup.rotation, {
                x: -Math.PI / 6, // 30도 뒤로
                z: -Math.PI / 8, // 15도 바깥으로
                duration: 1.0,
                ease: "power2.inOut"
            }, "<");

            // 4. 인사 유지 (1초)
            getOffTimeline.to({}, { duration: 1.0 });

            // 5. 인사 후 원위치
            getOffTimeline.to(bodyGroup.rotation, {
                x: 0,
                duration: 0.8,
                ease: "power2.inOut",
                onStart: () => {
                    console.log('[인사] 원위치');
                }
            });

            getOffTimeline.to([leftArmGroup.rotation, rightArmGroup.rotation], {
                x: 0,
                z: 0,
                duration: 0.8,
                ease: "power2.inOut"
            }, "<");
        }

        // 인트로용 집사 인사 (인트로 종료 처리 포함)
        function playIntroButlerBow() {
            console.log('=== 인트로 집사 인사 시작 ===');

            const bowTimeline = gsap.timeline({
                onComplete: () => {
                    isMoving = false;
                    sceneState = 'ROOM';
                    console.log('=== 인트로 집사 인사 완료 - 인트로 종료, 이동 가능 ===');
                    // 말풍선 표시
                    showSpeechBubble();
                }
            });

            // 1. 허리를 기준으로 상체 전체 숙이기
            bowTimeline.to(bodyGroup.rotation, {
                x: Math.PI * 0.4, // 72도
                duration: 1.0,
                ease: "power2.inOut"
            });

            // 2. 왼팔 - 가슴에 올리기
            bowTimeline.to(leftArmGroup.rotation, {
                x: Math.PI / 3, // 60도 앞으로
                z: Math.PI / 6, // 30도 안쪽으로
                duration: 1.0,
                ease: "power2.inOut"
            }, "<");

            // 3. 오른팔 - 뒤로 넘기기
            bowTimeline.to(rightArmGroup.rotation, {
                x: -Math.PI / 6, // 30도 뒤로
                z: -Math.PI / 8, // 15도 바깥으로
                duration: 1.0,
                ease: "power2.inOut"
            }, "<");

            // 4. 인사 유지 (1초)
            bowTimeline.to({}, { duration: 1.0 });

            // 5. 원위치
            bowTimeline.to(bodyGroup.rotation, {
                x: 0,
                duration: 0.8,
                ease: "power2.inOut"
            });

            bowTimeline.to([leftArmGroup.rotation, rightArmGroup.rotation], {
                x: 0,
                z: 0,
                duration: 0.8,
                ease: "power2.inOut"
            }, "<");
        }

        // G키 집사 인사 모션 (테스트용)
        function playButlerBow() {
            if (isMoving) return;
            isMoving = true;
            console.log('=== G키: 집사 인사 모션 테스트 ===');

            const bowTimeline = gsap.timeline({
                onComplete: () => {
                    isMoving = false;
                    console.log('=== 집사 인사 완료 ===');
                }
            });

            // 1. 허리를 기준으로 상체 전체 숙이기 (70도 - 이미지처럼 깊게)
            bowTimeline.to(bodyGroup.rotation, {
                x: Math.PI * 0.4, // 72도 (약 70도)
                duration: 1.0,
                ease: "power2.inOut"
            });

            // 2. 왼팔 - 가슴에 올리기 (이미지처럼 왼손을 가슴에)
            bowTimeline.to(leftArmGroup.rotation, {
                x: Math.PI / 3, // 60도 앞으로
                z: Math.PI / 6, // 30도 안쪽으로
                duration: 1.0,
                ease: "power2.inOut"
            }, "<");

            // 3. 오른팔 - 뒤로 넘기기 (이미지처럼 뒤로)
            bowTimeline.to(rightArmGroup.rotation, {
                x: -Math.PI / 6, // 30도 뒤로
                z: -Math.PI / 8, // 15도 바깥으로
                duration: 1.0,
                ease: "power2.inOut"
            }, "<");

            // 4. 인사 유지 (1초)
            bowTimeline.to({}, { duration: 1.0 });

            // 5. 원위치
            bowTimeline.to(bodyGroup.rotation, {
                x: 0,
                duration: 0.8,
                ease: "power2.inOut"
            });

            bowTimeline.to([leftArmGroup.rotation, rightArmGroup.rotation], {
                x: 0,
                z: 0,
                duration: 0.8,
                ease: "power2.inOut"
            }, "<");
        }

        // 리모컨 시퀀스
        function startRemoteSequence() {
            console.log('=== 리모컨 시퀀스 시작 ===');
            sceneState = 'REMOTE_READY';

            const remoteTimeline = gsap.timeline({
                onComplete: () => {
                    console.log('리모컨 애니메이션 완료 - 홀로그램 메뉴 표시');
                }
            });

            // 1. 오른팔 들어 올리기 (리모컨 꺼내기)
            remoteTimeline.to(rightArmGroup.rotation, {
                x: -Math.PI / 3, // 팔을 앞으로
                z: Math.PI / 12,
                duration: 0.8,
                ease: "power2.inOut",
                onStart: () => {
                    console.log('[리모컨] 오른팔 들기 시작');
                }
            });

            // 2. 리모컨 표시
            remoteTimeline.call(() => {
                remoteGroup.visible = true;
                console.log('[리모컨] 리모컨 오브젝트 표시');

                // 리모컨 반짝임 효과
                gsap.to(remoteBody.material, {
                    emissiveIntensity: 0.8,
                    duration: 0.3,
                    yoyo: true,
                    repeat: 3
                });
            }, null, 0.5);

            // 3. 홀로그램 메뉴 표시 (임시 비활성화)
            // remoteTimeline.call(() => {
            //     console.log('[리모컨] 홀로그램 메뉴 표시');
            //     showHologramMenu();
            // }, null, 1.5);
        }

        // 홀로그램 메뉴 선택 상태
        let selectedMenuIndex = 0; // 0: Profile, 1: Blog
        let speechBubbleGroup = null; // 3D 말풍선 그룹

        // 3D 말풍선 메뉴 생성
        function create3DSpeechBubble() {
            const bubbleGroup = new THREE.Group();

            // 말풍선 본체 (둥근 사각형)
            const bubbleGeometry = new THREE.BoxGeometry(3, 2, 0.1);
            const bubbleMaterial = new THREE.MeshToonMaterial({
                color: 0xffffff,
                emissive: 0xffffff,
                emissiveIntensity: 0.3,
                transparent: true,
                opacity: 0.95
            });
            const bubbleBody = new THREE.Mesh(bubbleGeometry, bubbleMaterial);
            bubbleGroup.add(bubbleBody);

            // 말풍선 윤곽선
            const bubbleEdges = new THREE.EdgesGeometry(bubbleGeometry);
            const bubbleOutline = new THREE.LineSegments(
                bubbleEdges,
                new THREE.LineBasicMaterial({ color: 0x333333, linewidth: 2 })
            );
            bubbleGroup.add(bubbleOutline);

            // 말풍선 꼬리 (삼각형)
            const tailGeometry = new THREE.ConeGeometry(0.2, 0.5, 3);
            const tailMaterial = new THREE.MeshToonMaterial({
                color: 0xffffff,
                emissive: 0xffffff,
                emissiveIntensity: 0.3
            });
            const tail = new THREE.Mesh(tailGeometry, tailMaterial);
            tail.rotation.z = -Math.PI / 2;
            tail.position.set(-1.3, -0.8, 0);
            bubbleGroup.add(tail);

            // Canvas로 텍스트 생성 (Profile / Blog 메뉴)
            const canvas = document.createElement('canvas');
            canvas.width = 512;
            canvas.height = 342;
            const ctx = canvas.getContext('2d');

            // 배경 투명
            ctx.clearRect(0, 0, 512, 342);

            // 제목
            ctx.fillStyle = '#333333';
            ctx.font = 'bold 32px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('💭 어디로 갈까요?', 256, 50);

            // Profile 버튼
            ctx.fillStyle = selectedMenuIndex === 0 ? '#667eea' : '#999999';
            ctx.fillRect(80, 90, 352, 70);
            ctx.strokeStyle = '#333333';
            ctx.lineWidth = 4;
            ctx.strokeRect(80, 90, 352, 70);

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 28px Arial';
            ctx.fillText('🧑‍💻 Profile Room', 256, 135);

            // Blog 버튼
            ctx.fillStyle = selectedMenuIndex === 1 ? '#f093fb' : '#999999';
            ctx.fillRect(80, 180, 352, 70);
            ctx.strokeStyle = '#333333';
            ctx.lineWidth = 4;
            ctx.strokeRect(80, 180, 352, 70);

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 28px Arial';
            ctx.fillText('📝 Blog', 256, 225);

            // 안내문
            ctx.fillStyle = '#666666';
            ctx.font = '18px Arial';
            ctx.fillText('⌨️ ↑↓로 선택 | Enter로 확정', 256, 290);

            const texture = new THREE.CanvasTexture(canvas);
            const textMaterial = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true
            });
            const textGeometry = new THREE.PlaneGeometry(2.8, 1.87);
            const textMesh = new THREE.Mesh(textGeometry, textMaterial);
            textMesh.position.z = 0.06; // 말풍선 앞에 배치
            bubbleGroup.add(textMesh);

            // 캐릭터 옆에 배치 (캐릭터 위치 기준)
            bubbleGroup.position.set(
                character.position.x + 2, // 캐릭터 오른쪽
                character.position.y + 2, // 캐릭터 위
                character.position.z
            );

            // 카메라를 향하도록 회전 (항상 정면)
            bubbleGroup.lookAt(camera.position);

            // 부드러운 등장 애니메이션
            bubbleGroup.scale.set(0, 0, 0);
            gsap.to(bubbleGroup.scale, {
                x: 1,
                y: 1,
                z: 1,
                duration: 0.5,
                ease: "back.out(1.7)"
            });

            // 떠다니는 효과
            gsap.to(bubbleGroup.position, {
                y: character.position.y + 2.3,
                duration: 1.5,
                yoyo: true,
                repeat: -1,
                ease: "sine.inOut"
            });

            scene.add(bubbleGroup);
            speechBubbleGroup = bubbleGroup;
            return bubbleGroup;
        }

        // 3D 말풍선 업데이트 (선택 변경 시)
        function update3DSpeechBubble() {
            if (!speechBubbleGroup) return;

            // 텍스트 메시 찾기
            const textMesh = speechBubbleGroup.children.find(
                child => child.material && child.material.map
            );
            if (!textMesh) return;

            // Canvas 다시 그리기
            const canvas = document.createElement('canvas');
            canvas.width = 512;
            canvas.height = 342;
            const ctx = canvas.getContext('2d');

            ctx.clearRect(0, 0, 512, 342);

            // 제목
            ctx.fillStyle = '#333333';
            ctx.font = 'bold 32px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('💭 어디로 갈까요?', 256, 50);

            // Profile 버튼
            ctx.fillStyle = selectedMenuIndex === 0 ? '#667eea' : '#999999';
            ctx.fillRect(80, 90, 352, 70);
            ctx.strokeStyle = '#333333';
            ctx.lineWidth = 4;
            ctx.strokeRect(80, 90, 352, 70);

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 28px Arial';
            ctx.fillText('🧑‍💻 Profile Room', 256, 135);

            // Blog 버튼
            ctx.fillStyle = selectedMenuIndex === 1 ? '#f093fb' : '#999999';
            ctx.fillRect(80, 180, 352, 70);
            ctx.strokeStyle = '#333333';
            ctx.lineWidth = 4;
            ctx.strokeRect(80, 180, 352, 70);

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 28px Arial';
            ctx.fillText('📝 Blog', 256, 225);

            // 안내문
            ctx.fillStyle = '#666666';
            ctx.font = '18px Arial';
            ctx.fillText('⌨️ ↑↓로 선택 | Enter로 확정', 256, 290);

            // 텍스처 업데이트
            const texture = new THREE.CanvasTexture(canvas);
            textMesh.material.map = texture;
            textMesh.material.needsUpdate = true;

            // 발광 효과
            gsap.to(textMesh.scale, {
                x: 1.05,
                y: 1.05,
                duration: 0.2,
                yoyo: true,
                repeat: 1
            });
        }

        // 말풍선 메뉴 표시 (3D로 변경)
        function showHologramMenu() {
            create3DSpeechBubble();
            enableMenuNavigation();
        }

        // 키보드 네비게이션 함수
        function enableMenuNavigation() {
            function updateSelection(newIndex) {
                selectedMenuIndex = newIndex;
                update3DSpeechBubble();
            }

            // 키보드 이벤트 리스너
            function handleMenuKeydown(e) {
                if (!speechBubbleGroup) return;

                if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    updateSelection(0);
                } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    updateSelection(1);
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    const mode = selectedMenuIndex === 0 ? 'profile' : 'blog';
                    window.selectMode(mode);
                }
            }

            // 이벤트 리스너 등록
            document.addEventListener('keydown', handleMenuKeydown);

            // 메뉴가 닫힐 때 이벤트 리스너 제거 (speechBubbleGroup 체크)
            const checkInterval = setInterval(() => {
                if (!speechBubbleGroup || !scene.children.includes(speechBubbleGroup)) {
                    document.removeEventListener('keydown', handleMenuKeydown);
                    clearInterval(checkInterval);
                }
            }, 100);
        }

        // 모드 선택 처리
        window.selectMode = function(mode) {
            // 3D 말풍선 페이드아웃 효과
            if (speechBubbleGroup) {
                gsap.to(speechBubbleGroup.scale, {
                    x: 0,
                    y: 0,
                    z: 0,
                    duration: 0.5,
                    ease: "back.in(1.7)",
                    onComplete: () => {
                        scene.remove(speechBubbleGroup);
                        speechBubbleGroup = null;
                    }
                });
            }

            if (mode === 'profile') {
                sceneState = 'SELECT_PROFILE';
                console.log('[메뉴] Profile 선택 - CMD 창 열기');
                // 프로필 버튼 클릭 시 리모콘 동작 후 CMD 창 열기
                playRemoteControlAction(() => {
                    openCmdWindow();
                });
            } else if (mode === 'blog') {
                sceneState = 'SELECT_BLOG';
                console.log('[메뉴] Blog 선택 - 블로그로 이동');
                // 블로그 페이지로 이동
                setTimeout(() => {
                    window.location.href = 'index_blog.html';
                }, 800);
            }
        };

        // 시작
        animate();

        // 인트로 시퀀스 즉시 시작
        startIntroSequence();
}); // DOMContentLoaded end