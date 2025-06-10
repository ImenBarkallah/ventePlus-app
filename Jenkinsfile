pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = 'localhost:8081'
        SONAR_HOST_URL = 'http://sonarqube:9000'
        DOCKER_COMPOSE_FILE = 'docker-compose.yml'
        STAGING_ENV = 'staging'
        PRODUCTION_ENV = 'production'
    }
    
    tools {
        maven 'Maven-3.9.0'
        jdk 'JDK-17'
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out source code...'
                checkout scm
                script {
                    env.GIT_COMMIT_SHORT = sh(
                        script: "git rev-parse --short HEAD",
                        returnStdout: true
                    ).trim()
                    env.BUILD_VERSION = "${env.BUILD_NUMBER}-${env.GIT_COMMIT_SHORT}"
                }
            }
        }
        
        stage('Build Backend Services') {
            parallel {
                stage('Build Config Service') {
                    steps {
                        dir('vente_plus_back/config-service') {
                            sh 'mvn clean compile -DskipTests'
                        }
                    }
                }
                stage('Build Eureka Service') {
                    steps {
                        dir('vente_plus_back/eureka-service') {
                            sh 'mvn clean compile -DskipTests'
                        }
                    }
                }
                stage('Build Gateway Service') {
                    steps {
                        dir('vente_plus_back/gateway-service') {
                            sh 'mvn clean compile -DskipTests'
                        }
                    }
                }
                stage('Build Client Service') {
                    steps {
                        dir('vente_plus_back/client-service') {
                            sh 'mvn clean compile -DskipTests'
                        }
                    }
                }
                stage('Build Product Service') {
                    steps {
                        dir('vente_plus_back/produitservice') {
                            sh 'mvn clean compile -DskipTests'
                        }
                    }
                }
                stage('Build Category Service') {
                    steps {
                        dir('vente_plus_back/categorie-service') {
                            sh 'mvn clean compile -DskipTests'
                        }
                    }
                }
                stage('Build Facture Service') {
                    steps {
                        dir('vente_plus_back/facture-service') {
                            sh 'mvn clean compile -DskipTests'
                        }
                    }
                }
                stage('Build Devis Service') {
                    steps {
                        dir('vente_plus_back/devis-service') {
                            sh 'mvn clean compile -DskipTests'
                        }
                    }
                }
                stage('Build Reglement Service') {
                    steps {
                        dir('vente_plus_back/reglement-service') {
                            sh 'mvn clean compile -DskipTests'
                        }
                    }
                }
                stage('Build Dashboard Service') {
                    steps {
                        dir('vente_plus_back/dashbord-service') {
                            sh 'mvn clean compile -DskipTests'
                        }
                    }
                }
            }
        }
        
        stage('Unit Tests') {
            parallel {
                stage('Test Config Service') {
                    steps {
                        dir('vente_plus_back/config-service') {
                            sh 'mvn test'
                            publishTestResults testResultsPattern: 'target/surefire-reports/*.xml'
                        }
                    }
                }
                stage('Test Eureka Service') {
                    steps {
                        dir('vente_plus_back/eureka-service') {
                            sh 'mvn test'
                            publishTestResults testResultsPattern: 'target/surefire-reports/*.xml'
                        }
                    }
                }
                stage('Test Gateway Service') {
                    steps {
                        dir('vente_plus_back/gateway-service') {
                            sh 'mvn test'
                            publishTestResults testResultsPattern: 'target/surefire-reports/*.xml'
                        }
                    }
                }
                stage('Test Client Service') {
                    steps {
                        dir('vente_plus_back/client-service') {
                            sh 'mvn test'
                            publishTestResults testResultsPattern: 'target/surefire-reports/*.xml'
                        }
                    }
                }
                stage('Test Product Service') {
                    steps {
                        dir('vente_plus_back/produitservice') {
                            sh 'mvn test'
                            publishTestResults testResultsPattern: 'target/surefire-reports/*.xml'
                        }
                    }
                }
                stage('Test Category Service') {
                    steps {
                        dir('vente_plus_back/categorie-service') {
                            sh 'mvn test'
                            publishTestResults testResultsPattern: 'target/surefire-reports/*.xml'
                        }
                    }
                }
                stage('Test Facture Service') {
                    steps {
                        dir('vente_plus_back/facture-service') {
                            sh 'mvn test'
                            publishTestResults testResultsPattern: 'target/surefire-reports/*.xml'
                        }
                    }
                }
                stage('Test Devis Service') {
                    steps {
                        dir('vente_plus_back/devis-service') {
                            sh 'mvn test'
                            publishTestResults testResultsPattern: 'target/surefire-reports/*.xml'
                        }
                    }
                }
                stage('Test Reglement Service') {
                    steps {
                        dir('vente_plus_back/reglement-service') {
                            sh 'mvn test'
                            publishTestResults testResultsPattern: 'target/surefire-reports/*.xml'
                        }
                    }
                }
                stage('Test Dashboard Service') {
                    steps {
                        dir('vente_plus_back/dashbord-service') {
                            sh 'mvn test'
                            publishTestResults testResultsPattern: 'target/surefire-reports/*.xml'
                        }
                    }
                }
            }
        }
        
        stage('Code Quality Analysis') {
            steps {
                script {
                    def services = [
                        'config-service', 'eureka-service', 'gateway-service', 
                        'client-service', 'produitservice', 'categorie-service',
                        'facture-service', 'devis-service', 'reglement-service', 
                        'dashbord-service'
                    ]
                    
                    services.each { service ->
                        dir("vente_plus_back/${service}") {
                            withSonarQubeEnv('SonarQube') {
                                sh """
                                    mvn sonar:sonar \
                                        -Dsonar.projectKey=${service} \
                                        -Dsonar.projectName=${service} \
                                        -Dsonar.projectVersion=${env.BUILD_VERSION} \
                                        -Dsonar.host.url=${SONAR_HOST_URL}
                                """
                            }
                        }
                    }
                }
            }
        }
        
        stage('Quality Gate') {
            steps {
                timeout(time: 10, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }
        
        stage('Package Applications') {
            parallel {
                stage('Package Backend Services') {
                    steps {
                        script {
                            def services = [
                                'config-service', 'eureka-service', 'gateway-service', 
                                'client-service', 'produitservice', 'categorie-service',
                                'facture-service', 'devis-service', 'reglement-service', 
                                'dashbord-service'
                            ]
                            
                            services.each { service ->
                                dir("vente_plus_back/${service}") {
                                    sh 'mvn clean package -DskipTests'
                                }
                            }
                        }
                    }
                }
                stage('Build Frontend') {
                    steps {
                        dir('vente_plus_front') {
                            sh 'npm ci'
                            sh 'npm run build'
                        }
                    }
                }
            }
        }
        
        stage('Build Docker Images') {
            steps {
                script {
                    def services = [
                        'config-service', 'eureka-service', 'gateway-service', 
                        'client-service', 'produitservice', 'categorie-service',
                        'facture-service', 'devis-service', 'reglement-service', 
                        'dashbord-service'
                    ]
                    
                    // Build backend services
                    services.each { service ->
                        sh """
                            docker build -t ${DOCKER_REGISTRY}/venteplus-${service}:${env.BUILD_VERSION} \
                                         -t ${DOCKER_REGISTRY}/venteplus-${service}:latest \
                                         ./vente_plus_back/${service}
                        """
                    }
                    
                    // Build frontend
                    sh """
                        docker build -t ${DOCKER_REGISTRY}/venteplus-frontend:${env.BUILD_VERSION} \
                                     -t ${DOCKER_REGISTRY}/venteplus-frontend:latest \
                                     ./vente_plus_front
                    """
                }
            }
        }
        
        stage('Security Scanning') {
            parallel {
                stage('Vulnerability Scan') {
                    steps {
                        script {
                            def services = [
                                'config-service', 'eureka-service', 'gateway-service', 
                                'client-service', 'produitservice', 'categorie-service',
                                'facture-service', 'devis-service', 'reglement-service', 
                                'dashbord-service', 'frontend'
                            ]
                            
                            services.each { service ->
                                sh """
                                    docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
                                        aquasec/trivy image ${DOCKER_REGISTRY}/venteplus-${service}:${env.BUILD_VERSION}
                                """
                            }
                        }
                    }
                }
                stage('OWASP Dependency Check') {
                    steps {
                        dependencyCheck additionalArguments: '--format XML --format HTML', odcInstallation: 'OWASP-DC'
                        dependencyCheckPublisher pattern: 'dependency-check-report.xml'
                    }
                }
            }
        }
        
        stage('Push to Registry') {
            steps {
                script {
                    def services = [
                        'config-service', 'eureka-service', 'gateway-service', 
                        'client-service', 'produitservice', 'categorie-service',
                        'facture-service', 'devis-service', 'reglement-service', 
                        'dashbord-service', 'frontend'
                    ]
                    
                    services.each { service ->
                        sh "docker push ${DOCKER_REGISTRY}/venteplus-${service}:${env.BUILD_VERSION}"
                        sh "docker push ${DOCKER_REGISTRY}/venteplus-${service}:latest"
                    }
                }
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
        success {
            echo 'Pipeline completed successfully!'
            // Send success notification
        }
        failure {
            echo 'Pipeline failed!'
            // Send failure notification
        }
    }
}
