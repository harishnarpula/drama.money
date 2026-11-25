import { useEffect, useRef } from 'react'
import * as THREE from 'three'

function roundedPanel(width: number, height: number, radius: number, depth: number, color: number) {
  const shape = new THREE.Shape()
  const x = -width / 2
  const y = -height / 2
  shape.moveTo(x + radius, y)
  shape.lineTo(x + width - radius, y)
  shape.quadraticCurveTo(x + width, y, x + width, y + radius)
  shape.lineTo(x + width, y + height - radius)
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  shape.lineTo(x + radius, y + height)
  shape.quadraticCurveTo(x, y + height, x, y + height - radius)
  shape.lineTo(x, y + radius)
  shape.quadraticCurveTo(x, y, x + radius, y)

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelSegments: 4,
    steps: 1,
    bevelSize: 0.035,
    bevelThickness: 0.035,
  })
  geometry.center()
  const material = new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.28,
    metalness: 0.08,
    clearcoat: 0.85,
    clearcoatRoughness: 0.2,
  })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.castShadow = true
  mesh.receiveShadow = true
  return mesh
}

function createPhone(accent: number) {
  const phone = new THREE.Group()
  const frame = roundedPanel(1.65, 3.15, 0.23, 0.18, 0x24372c)
  const screen = roundedPanel(1.44, 2.86, 0.18, 0.035, accent)
  screen.position.z = 0.12
  phone.add(frame, screen)

  const speaker = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.025, 0.24, 4, 10),
    new THREE.MeshStandardMaterial({ color: 0xd8d0c2, roughness: 0.45 }),
  )
  speaker.rotation.z = Math.PI / 2
  speaker.position.set(0, 1.24, 0.18)
  phone.add(speaker)

  const playDisc = new THREE.Mesh(
    new THREE.CylinderGeometry(0.29, 0.29, 0.08, 48),
    new THREE.MeshPhysicalMaterial({ color: 0xe6e0d5, roughness: 0.25, clearcoat: 1 }),
  )
  playDisc.rotation.x = Math.PI / 2
  playDisc.position.set(0, 0.08, 0.19)
  phone.add(playDisc)

  const triangle = new THREE.Shape()
  triangle.moveTo(-0.08, -0.12)
  triangle.lineTo(0.15, 0)
  triangle.lineTo(-0.08, 0.12)
  triangle.closePath()
  const play = new THREE.Mesh(
    new THREE.ShapeGeometry(triangle),
    new THREE.MeshStandardMaterial({ color: 0x24372c, roughness: 0.4 }),
  )
  play.position.set(0.015, 0.08, 0.245)
  phone.add(play)

  const progress = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.018, 0.82, 4, 10),
    new THREE.MeshStandardMaterial({ color: 0xe6e0d5, roughness: 0.5 }),
  )
  progress.rotation.z = Math.PI / 2
  progress.position.set(0, -1.12, 0.19)
  phone.add(progress)
  return phone
}

function createBriefcase() {
  const group = new THREE.Group()
  const body = roundedPanel(1.15, 0.78, 0.12, 0.26, 0x5d7766)
  group.add(body)
  const handle = new THREE.Mesh(
    new THREE.TorusGeometry(0.23, 0.045, 12, 32, Math.PI),
    new THREE.MeshStandardMaterial({ color: 0xe6e0d5, roughness: 0.35 }),
  )
  handle.position.set(0, 0.45, 0)
  group.add(handle)
  return group
}

export default function HeroScene() {
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
    camera.position.set(0, 0.1, 9.2)

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
    } catch {
      host.dataset.webgl = 'unavailable'
      return
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.08
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.domElement.className = 'absolute inset-0 block size-full'
    renderer.domElement.setAttribute('aria-hidden', 'true')
    host.appendChild(renderer.domElement)

    scene.add(new THREE.HemisphereLight(0xfaf7ef, 0x24372c, 2.4))
    const key = new THREE.DirectionalLight(0xffffff, 4.2)
    key.position.set(4, 6, 7)
    key.castShadow = true
    scene.add(key)
    const rim = new THREE.PointLight(0xa7c0ad, 35, 18)
    rim.position.set(-4, 1.5, 4)
    scene.add(rim)

    const world = new THREE.Group()
    world.rotation.x = -0.06
    scene.add(world)

    const centerPhone = createPhone(0x718777)
    centerPhone.scale.setScalar(1.16)
    centerPhone.position.set(0, 0.15, 0.55)
    centerPhone.rotation.y = -0.05
    world.add(centerPhone)

    const leftPhone = createPhone(0x9a927f)
    leftPhone.scale.setScalar(0.78)
    leftPhone.position.set(-2.2, 0.35, -0.4)
    leftPhone.rotation.set(0.08, 0.38, -0.11)
    world.add(leftPhone)

    const rightPhone = createPhone(0x425d4d)
    rightPhone.scale.setScalar(0.82)
    rightPhone.position.set(2.2, 0.15, -0.25)
    rightPhone.rotation.set(-0.04, -0.4, 0.1)
    world.add(rightPhone)

    const briefcase = createBriefcase()
    briefcase.position.set(2.35, -1.8, 0.6)
    briefcase.rotation.set(-0.18, -0.38, 0.08)
    world.add(briefcase)

    const skillOrb = new THREE.Mesh(
      new THREE.TorusKnotGeometry(0.42, 0.13, 100, 18),
      new THREE.MeshPhysicalMaterial({ color: 0xe6e0d5, roughness: 0.24, metalness: 0.16, clearcoat: 1 }),
    )
    skillOrb.position.set(-2.25, -1.65, 0.75)
    skillOrb.castShadow = true
    world.add(skillOrb)

    const ringMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x8ca090,
      roughness: 0.18,
      metalness: 0.2,
      transparent: true,
      opacity: 0.46,
      side: THREE.DoubleSide,
    })
    const orbitRing = new THREE.Mesh(new THREE.TorusGeometry(3.25, 0.025, 10, 100), ringMaterial)
    orbitRing.rotation.x = 1.08
    orbitRing.rotation.z = 0.2
    world.add(orbitRing)

    const particleGeometry = new THREE.IcosahedronGeometry(0.055, 1)
    const particleMaterial = new THREE.MeshStandardMaterial({ color: 0xe6e0d5, roughness: 0.3 })
    const particles = new THREE.InstancedMesh(particleGeometry, particleMaterial, 30)
    const dummy = new THREE.Object3D()
    for (let index = 0; index < 30; index += 1) {
      const angle = (index / 30) * Math.PI * 2
      const radius = 3.15 + Math.sin(index * 2.4) * 0.35
      dummy.position.set(Math.cos(angle) * radius, Math.sin(angle) * 1.65, Math.sin(angle * 2) * 0.8 - 0.5)
      dummy.scale.setScalar(0.65 + (index % 4) * 0.16)
      dummy.updateMatrix()
      particles.setMatrixAt(index, dummy.matrix)
    }
    world.add(particles)

    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(3.1, 64),
      new THREE.ShadowMaterial({ color: 0x15241b, opacity: 0.2 }),
    )
    shadow.rotation.x = -Math.PI / 2
    shadow.position.set(0, -2.35, -0.3)
    shadow.receiveShadow = true
    world.add(shadow)

    const pointer = new THREE.Vector2()
    let dragX = 0
    let dragY = 0
    let isDragging = false
    let lastX = 0
    let lastY = 0
    let frame = 0
    let visible = true

    const resize = () => {
      const { width, height } = host.getBoundingClientRect()
      if (!width || !height) return
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height, false)
      renderer.render(scene, camera)
    }

    const pointerMove = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect()
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
      if (isDragging) {
        dragY += (event.clientX - lastX) * 0.006
        dragX += (event.clientY - lastY) * 0.004
        lastX = event.clientX
        lastY = event.clientY
      }
    }
    const pointerDown = (event: PointerEvent) => {
      isDragging = true
      lastX = event.clientX
      lastY = event.clientY
      host.setPointerCapture(event.pointerId)
      host.classList.add('is-dragging')
    }
    const pointerUp = (event: PointerEvent) => {
      isDragging = false
      if (host.hasPointerCapture(event.pointerId)) host.releasePointerCapture(event.pointerId)
      host.classList.remove('is-dragging')
    }

    host.addEventListener('pointermove', pointerMove)
    host.addEventListener('pointerdown', pointerDown)
    host.addEventListener('pointerup', pointerUp)
    host.addEventListener('pointercancel', pointerUp)
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(host)
    const intersectionObserver = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting }, { threshold: 0.02 })
    intersectionObserver.observe(host)

    const clock = new THREE.Clock()
    const animate = () => {
      frame = window.requestAnimationFrame(animate)
      if (!visible || document.hidden) return
      const time = clock.getElapsedTime()
      const targetY = dragY + pointer.x * 0.18
      const targetX = -0.06 + dragX + pointer.y * 0.1
      world.rotation.y += (targetY - world.rotation.y) * 0.055
      world.rotation.x += (targetX - world.rotation.x) * 0.055
      centerPhone.position.y = 0.15 + Math.sin(time * 0.8) * 0.09
      leftPhone.position.y = 0.35 + Math.sin(time * 0.95 + 1.3) * 0.1
      rightPhone.position.y = 0.15 + Math.sin(time * 0.9 + 2.6) * 0.11
      skillOrb.rotation.x = time * 0.42
      skillOrb.rotation.y = time * 0.56
      orbitRing.rotation.z = 0.2 + time * 0.055
      particles.rotation.z = time * 0.025
      renderer.render(scene, camera)
    }

    resize()
    if (reduceMotion) renderer.render(scene, camera)
    else animate()

    return () => {
      window.cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      host.removeEventListener('pointermove', pointerMove)
      host.removeEventListener('pointerdown', pointerDown)
      host.removeEventListener('pointerup', pointerUp)
      host.removeEventListener('pointercancel', pointerUp)
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose()
          const materials = Array.isArray(object.material) ? object.material : [object.material]
          materials.forEach((material) => material.dispose())
        }
      })
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  return (
    <div
      ref={hostRef}
      className="relative size-full min-h-[320px] overflow-hidden"
      role="img"
      aria-label="Interactive 3D world of skill videos, creator phones, career growth and verified content. Drag to rotate."
    >
      <div className="absolute inset-0 -z-10 grid place-items-center" aria-hidden="true"><span className="grid size-16 place-items-center rounded-2xl bg-[#24372C] font-black text-white">DM</span></div>
    </div>
  )
}
