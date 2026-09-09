import { JarFile } from '../types';

export const INITIAL_JAR_FILES: JarFile[] = [
  {
    id: 'jar-velocity-3-3-0',
    fileName: 'velocity-proxy-3.3.0.jar',
    title: 'Velocity High-Performance Proxy',
    description: 'Next-generation Minecraft server proxy offering unparalleled performance, security hardening against exploits, and modern plugin API extensions.',
    version: 'v3.3.0-SNAPSHOT',
    fileSizeBytes: 15518924, // ~14.8 MB
    uploadDate: '2026-08-28T14:20:00Z',
    downloadCount: 1420,
    iconCategory: 'network',
    javaVersion: 'Java 17+',
    mainClass: 'com.velocitypowered.proxy.Velocity',
    sha256Checksum: '9f83a4bc602b9e8301ec9b8d2518e38c35b801b7a2d6c340156d9be70b13d2f9',
    changelog: `### Velocity 3.3.0 Release Notes
* Enhanced Netty native transport bindings for Linux epoll and macOS kqueue.
* Resolved upstream packet compression edge cases under heavy burst traffic.
* Modernized command registration pipeline with brigadier improvements.
* Memory consumption reduced by 18% during concurrent player handshakes.`,
  },
  {
    id: 'jar-spark-profiler',
    fileName: 'spark-profiler-1.10.53.jar',
    title: 'Spark Performance Profiler',
    description: 'Low-overhead CPU sampler, memory heap inspection, and thread allocation profiler for JVM applications and server runtimes.',
    version: 'v1.10.53',
    fileSizeBytes: 2621440, // ~2.5 MB
    uploadDate: '2026-09-02T10:15:00Z',
    downloadCount: 3890,
    iconCategory: 'tool',
    javaVersion: 'Java 8+',
    mainClass: 'me.lucko.spark.bukkit.SparkBukkitPlugin',
    sha256Checksum: 'a71e8432b0f34c679e95123d548320ab921c84ff10582dbe02428581e9382103',
    changelog: `### Spark 1.10.53 Changes
* Added support for Java 22 virtual thread stack tracing.
* Improved Web viewer JSON payload serialization speed.
* Fixed tick rate variance calculation during server freeze states.`,
  },
  {
    id: 'jar-fawe-engine',
    fileName: 'fastasyncworldedit-bukkit-2.8.4.jar',
    title: 'FastAsyncWorldEdit Engine',
    description: 'Blazing-fast asynchronous voxel manipulation engine designed for multi-threaded block operations and zero-lag server execution.',
    version: 'v2.8.4-RELEASE',
    fileSizeBytes: 19100000, // ~18.2 MB
    uploadDate: '2026-08-15T09:40:00Z',
    downloadCount: 5210,
    iconCategory: 'plugin',
    javaVersion: 'Java 17+',
    mainClass: 'com.fastasyncworldedit.bukkit.FAWEPlugin',
    sha256Checksum: 'c3580459c2bb023d854e48ab692e591782354710182470123be800a7b45129ff',
    changelog: `### FAWE 2.8.4 Highlights
* Re-engineered chunk dispatch queue using Lock-free ringbuffers.
* Added native schematic v3 format support with entity nbt tags.
* Fixed lighting calculation artifacts when pasting huge floating structures.`,
  },
  {
    id: 'jar-geyser-translator',
    fileName: 'geyser-spigot-2.2.0.jar',
    title: 'GeyserMC Protocol Translator',
    description: 'Enables Bedrock Edition players to connect to Java Edition servers seamlessly without client-side modifications.',
    version: 'v2.2.0-b481',
    fileSizeBytes: 12687770, // ~12.1 MB
    uploadDate: '2026-09-04T18:30:00Z',
    downloadCount: 4120,
    iconCategory: 'network',
    javaVersion: 'Java 17+',
    mainClass: 'org.geysermc.geyser.platform.spigot.GeyserSpigotPlugin',
    sha256Checksum: '3d87501a2f1c840293eb0415a77329fb817290123f81e05824982a0b41198cfa',
    changelog: `### Geyser 2.2.0 Protocol Update
* Synchronized mapping tables for latest Bedrock 1.20+ packet specs.
* Improved custom block model rendering and armor trim textures.
* Fixed inventory desynchronization when opening double chests rapidly.`,
  },
  {
    id: 'jar-liquibase-cli',
    fileName: 'liquibase-core-4.24.0.jar',
    title: 'Liquibase Database Migration Engine',
    description: 'Database schema change management solution for tracking, versioning, and deploying database changes across all relational environments.',
    version: 'v4.24.0',
    fileSizeBytes: 10171187, // ~9.7 MB
    uploadDate: '2026-07-20T11:00:00Z',
    downloadCount: 860,
    iconCategory: 'utility',
    javaVersion: 'Java 11+',
    mainClass: 'liquibase.integration.commandline.Main',
    sha256Checksum: 'e2098b4c0291f038472910ab3857201823901bca85921820491823abce019284',
    changelog: `### Liquibase 4.24.0
* Added native diff generation for PostgreSQL partition schemas.
* Enhanced rollback SQL generation for stored procedures.
* Optimized changelog lock release timeouts on connection drops.`,
  },
  {
    id: 'jar-grpc-stub',
    fileName: 'grpc-services-1.58.0.jar',
    title: 'gRPC Java Server Reflection & Services',
    description: 'Enterprise remote procedure call framework providing binary protocol buffers serialization and reactive streaming channels.',
    version: 'v1.58.0',
    fileSizeBytes: 4404019, // ~4.2 MB
    uploadDate: '2026-08-01T08:12:00Z',
    downloadCount: 1650,
    iconCategory: 'library',
    javaVersion: 'Java 8+',
    mainClass: 'io.grpc.protobuf.services.BinaryLogProviderImpl',
    sha256Checksum: '817293b4a091823f847102938472910283749102837491028374910283749102',
    changelog: `### gRPC Services 1.58.0
* Implemented ServerReflection v1 protocol alongside legacy v1alpha.
* Reduced context switching latency on virtual thread executors.
* Improved keep-alive ping throttling defaults.`,
  },
  {
    id: 'jar-guava-utils',
    fileName: 'guava-32.1.3-jre.jar',
    title: 'Google Guava Core Libraries',
    description: 'Google core libraries for Java: collection types, immutable graphs, functional primitives, caching utilities, and concurrency wrappers.',
    version: 'v32.1.3-jre',
    fileSizeBytes: 3040870, // ~2.9 MB
    uploadDate: '2026-06-10T16:00:00Z',
    downloadCount: 9400,
    iconCategory: 'library',
    javaVersion: 'Java 8+',
    sha256Checksum: '1928374650192837465019283746501928374650192837465019283746501928',
    changelog: `### Guava 32.1.3 Highlights
* Added modern Stream utilities and Collectors integration.
* Updated CacheBuilder concurrency level optimization.
* Security patches for localized file path resolution.`,
  },
  {
    id: 'jar-spring-launcher',
    fileName: 'spring-boot-loader-3.2.1.jar',
    title: 'Spring Boot Executable Launcher',
    description: 'Production-ready self-contained JAR launcher allowing nested JAR archives and classpath isolation for microservices.',
    version: 'v3.2.1',
    fileSizeBytes: 6815744, // ~6.5 MB
    uploadDate: '2026-08-11T12:00:00Z',
    downloadCount: 2780,
    iconCategory: 'server',
    javaVersion: 'Java 17+',
    mainClass: 'org.springframework.boot.loader.JarLauncher',
    sha256Checksum: 'f491823746501928374650192837465019283746501928374650192837465019',
    changelog: `### Spring Boot Loader 3.2.1
* Faster index-based class location in nested jar archives.
* Virtual thread support during application bootstrap.
* Enhanced GraalVM Native Image metadata hints.`,
  },
];
