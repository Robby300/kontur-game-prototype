plugins {
    application
}

group = "game.kontur"
version = "0.3.1-SNAPSHOT"

repositories {
    mavenCentral()
}

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

application {
    mainClass = "game.kontur.prototype.cli.Main"
}

tasks.named<JavaExec>("run") {
    standardInput = System.`in`
}

dependencies {
    testImplementation(platform("org.junit:junit-bom:5.14.1"))
    testImplementation("org.junit.jupiter:junit-jupiter")
    testImplementation("org.assertj:assertj-core:3.27.7")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

tasks.test {
    useJUnitPlatform()
    outputs.dir(layout.buildDirectory.dir("reports/kontur-v03"))
}

tasks.check {
    dependsOn(tasks.test)
}
