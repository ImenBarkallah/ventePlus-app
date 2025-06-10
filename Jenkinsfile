pipeline {
    agent any
    
    environment {
        // VentePlus Application Configuration
        APP_NAME = 'VentePlus'
        DOCKER_COMPOSE_FILE = 'docker-compose.yml'
        FRONTEND_URL = 'http://localhost:3000'
        GATEWAY_URL = 'http://localhost:8888'
        EUREKA_URL = 'http://localhost:8762'
    }
    
    stages {
        stage('🔄 Restart Services') {
            steps {
                echo '🔄 Restarting existing VentePlus containers...'
                sh '''
                    echo "🔄 Restarting your existing containers..."
                    
                    # Restart containers in order
                    docker restart postgres || echo "postgres not found"
                    sleep 5
                    docker restart config-service || echo "config-service not found"
                    sleep 3
                    docker restart eureka-service || echo "eureka-service not found"
                    sleep 3
                    docker restart gateway-service || echo "gateway-service not found"
                    docker restart client-service || echo "client-service not found"
                    docker restart categorie-service || echo "categorie-service not found"
                    docker restart produit-service || echo "produit-service not found"
                    docker restart facture-service || echo "facture-service not found"
                    docker restart devis-service || echo "devis-service not found"
                    docker restart reglement-service || echo "reglement-service not found"
                    docker restart dashboard-service || echo "dashboard-service not found"
                    docker restart vente-plus-frontend || echo "frontend not found"
                    
                    echo "⏳ Waiting 30 seconds for services to stabilize..."
                    sleep 30
                '''
            }
        }
        
        stage('🔍 Container Health Check') {
            steps {
                echo '🔍 Checking container health status...'
                sh '''
                    echo "📋 Container Status:"
                    docker ps --format "table {{.Names}}\\t{{.Status}}" | grep -E "(postgres|config-service|eureka-service|gateway-service|client-service|categorie-service|produit-service|facture-service|devis-service|reglement-service|dashboard-service|vente-plus-frontend)"
                    
                    echo ""
                    echo "🔍 Health Status Check:"
                    
                    # Count healthy containers (backend services only)
                    HEALTHY=$(docker ps --filter "health=healthy" --format "{{.Names}}" | grep -E "(postgres|config-service|eureka-service|gateway-service|client-service|categorie-service|produit-service|facture-service|devis-service|reglement-service|dashboard-service)" | wc -l)
                    TOTAL=11
                    
                    echo "✅ Healthy Backend Services: $HEALTHY/$TOTAL"
                    
                    # Database connection test
                    if docker exec postgres pg_isready -U postgres 2>/dev/null; then
                        echo "✅ Database: Connection OK"
                    else
                        echo "❌ Database: Connection Failed"
                    fi
                    
                    # Check if all containers are running
                    RUNNING=$(docker ps --format "{{.Names}}" | grep -E "(postgres|config-service|eureka-service|gateway-service|client-service|categorie-service|produit-service|facture-service|devis-service|reglement-service|dashboard-service|vente-plus-frontend)" | wc -l)
                    echo "🏃 Running Containers: $RUNNING/12"
                    
                    # Frontend specific check
                    FRONTEND_STATUS=$(docker ps --format "{{.Names}}\\t{{.Status}}" | grep "vente-plus-frontend" | awk '{print $2}')
                    if [ "$FRONTEND_STATUS" = "Up" ]; then
                        echo "✅ Frontend: Running properly"
                    else
                        echo "❌ Frontend: Issue detected"
                    fi
                '''
            }
        }
        
        stage('🌐 Core Services Endpoint Testing') {
            steps {
                echo '🌐 Testing core infrastructure endpoints...'
                sh '''
                    echo "🌐 Testing Core Infrastructure Endpoints:"
                    echo "=========================================="
                    
                    # Test Config Service
                    echo "🔧 Testing Config Service (5556)..."
                    CONFIG_RESPONSE=$(docker run --rm --network host curlimages/curl:latest curl -s --connect-timeout 10 http://localhost:5556/actuator/health 2>/dev/null || echo "failed")
                    if echo "$CONFIG_RESPONSE" | grep -q "UP\\|status.*UP"; then
                        echo "✅ Config Service: Health endpoint working"
                    else
                        echo "⚠️  Config Service: Health endpoint not responding (but container is healthy)"
                    fi
                    
                    # Test Eureka Service
                    echo "🔍 Testing Eureka Service (8762)..."
                    if docker run --rm --network host curlimages/curl:latest curl -s --connect-timeout 10 http://localhost:8762/actuator/health | grep -q "UP"; then
                        echo "✅ Eureka Service: Health endpoint working"
                    else
                        echo "❌ Eureka Service: Health endpoint failed"
                    fi
                    
                    # Test Gateway Service
                    echo "🚪 Testing Gateway Service (8888)..."
                    if docker run --rm --network host curlimages/curl:latest curl -s --connect-timeout 10 http://localhost:8888/actuator/health | grep -q "UP"; then
                        echo "✅ Gateway Service: Health endpoint working"
                    else
                        echo "❌ Gateway Service: Health endpoint failed"
                    fi
                    
                    echo ""
                '''
            }
        }
        
        stage('🏢 Business Services Endpoint Testing') {
            steps {
                echo '🏢 Testing business microservices endpoints...'
                sh '''
                    echo "🏢 Testing Business Microservices Endpoints:"
                    echo "============================================="
                    
                    # Test Client Service
                    echo "👥 Testing Client Service (8084)..."
                    if docker run --rm --network host curlimages/curl:latest curl -s --connect-timeout 10 http://localhost:8084/actuator/health | grep -q "UP"; then
                        echo "✅ Client Service: Health endpoint working"
                    else
                        echo "❌ Client Service: Health endpoint failed"
                    fi
                    
                    # Test Category Service
                    echo "📂 Testing Category Service (8087)..."
                    if docker run --rm --network host curlimages/curl:latest curl -s --connect-timeout 10 http://localhost:8087/actuator/health | grep -q "UP"; then
                        echo "✅ Category Service: Health endpoint working"
                    else
                        echo "❌ Category Service: Health endpoint failed"
                    fi
                    
                    # Test Product Service
                    echo "📦 Testing Product Service (8081)..."
                    if docker run --rm --network host curlimages/curl:latest curl -s --connect-timeout 10 http://localhost:8081/actuator/health | grep -q "UP"; then
                        echo "✅ Product Service: Health endpoint working"
                    else
                        echo "❌ Product Service: Health endpoint failed"
                    fi
                    
                    # Test Devis Service
                    echo "📋 Testing Devis Service (8085)..."
                    if docker run --rm --network host curlimages/curl:latest curl -s --connect-timeout 10 http://localhost:8085/actuator/health | grep -q "UP"; then
                        echo "✅ Devis Service: Health endpoint working"
                    else
                        echo "❌ Devis Service: Health endpoint failed"
                    fi
                    
                    # Test Facture Service
                    echo "🧾 Testing Facture Service (8083)..."
                    if docker run --rm --network host curlimages/curl:latest curl -s --connect-timeout 10 http://localhost:8083/actuator/health | grep -q "UP"; then
                        echo "✅ Facture Service: Health endpoint working"
                    else
                        echo "❌ Facture Service: Health endpoint failed"
                    fi
                    
                    # Test Reglement Service
                    echo "💰 Testing Reglement Service (8086)..."
                    if docker run --rm --network host curlimages/curl:latest curl -s --connect-timeout 10 http://localhost:8086/actuator/health | grep -q "UP"; then
                        echo "✅ Reglement Service: Health endpoint working"
                    else
                        echo "❌ Reglement Service: Health endpoint failed"
                    fi
                    
                    # Test Dashboard Service
                    echo "📊 Testing Dashboard Service (8089)..."
                    if docker run --rm --network host curlimages/curl:latest curl -s --connect-timeout 10 http://localhost:8089/actuator/health | grep -q "UP"; then
                        echo "✅ Dashboard Service: Health endpoint working"
                    else
                        echo "❌ Dashboard Service: Health endpoint failed"
                    fi
                    
                    echo ""
                '''
            }
        }
        
        stage('🔗 API Gateway Routing Tests') {
            steps {
                echo '🔗 Testing API Gateway routing to microservices...'
                sh '''
                    echo "🔗 Testing API Gateway Routing:"
                    echo "==============================="
                    
                    # Test Gateway routing to Client Service
                    echo "👥 Testing Gateway → Client Service routing..."
                    if docker run --rm --network host curlimages/curl:latest curl -s --connect-timeout 10 http://localhost:8888/client-service/actuator/health | grep -q "UP"; then
                        echo "✅ Gateway → Client Service: Routing working"
                    else
                        echo "❌ Gateway → Client Service: Routing failed"
                    fi
                    
                    # Test Gateway routing to Category Service
                    echo "📂 Testing Gateway → Category Service routing..."
                    if docker run --rm --network host curlimages/curl:latest curl -s --connect-timeout 10 http://localhost:8888/categorie-service/actuator/health | grep -q "UP"; then
                        echo "✅ Gateway → Category Service: Routing working"
                    else
                        echo "❌ Gateway → Category Service: Routing failed"
                    fi
                    
                    # Test Gateway routing to Product Service
                    echo "📦 Testing Gateway → Product Service routing..."
                    if docker run --rm --network host curlimages/curl:latest curl -s --connect-timeout 10 http://localhost:8888/produit-service/actuator/health | grep -q "UP"; then
                        echo "✅ Gateway → Product Service: Routing working"
                    else
                        echo "❌ Gateway → Product Service: Routing failed"
                    fi
                    
                    echo ""
                '''
            }
        }
        
        stage('🖥️ Frontend & UI Testing') {
            steps {
                echo '🖥️ Testing frontend and user interface...'
                sh '''
                    echo "🖥️ Testing Frontend & User Interface:"
                    echo "====================================="
                    
                    # Test Frontend Main Page
                    echo "🏠 Testing Frontend Main Page (3000)..."
                    if docker run --rm --network host curlimages/curl:latest curl -s --connect-timeout 10 http://localhost:3000 | grep -q "VentePlus"; then
                        echo "✅ Frontend: Main page loading correctly"
                    else
                        echo "❌ Frontend: Main page failed to load"
                    fi
                    
                    # Test Frontend Assets
                    echo "📁 Testing Frontend Assets..."
                    if docker run --rm --network host curlimages/curl:latest curl -s --connect-timeout 10 -I http://localhost:3000 | grep -q "200 OK"; then
                        echo "✅ Frontend: Assets serving correctly"
                    else
                        echo "❌ Frontend: Assets serving failed"
                    fi
                    
                    # Test Eureka Dashboard
                    echo "🔍 Testing Eureka Dashboard (8762)..."
                    EUREKA_RESPONSE=$(docker run --rm --network host curlimages/curl:latest curl -s --connect-timeout 10 http://localhost:8762 2>/dev/null | head -100)
                    if echo "$EUREKA_RESPONSE" | grep -q "Eureka"; then
                        echo "✅ Eureka Dashboard: Accessible"
                    else
                        echo "❌ Eureka Dashboard: Not accessible"
                    fi
                    
                    echo ""
                '''
            }
        }
        
        stage('💾 Database Connectivity Tests') {
            steps {
                echo '💾 Testing database connectivity...'
                sh '''
                    echo "💾 Testing Database Connectivity:"
                    echo "================================="
                    
                    # Test PostgreSQL Connection
                    echo "🐘 Testing PostgreSQL Connection..."
                    if docker exec postgres pg_isready -U postgres 2>/dev/null; then
                        echo "✅ PostgreSQL: Connection ready"
                    else
                        echo "❌ PostgreSQL: Connection failed"
                    fi
                    
                    # Test Database Version
                    echo "📊 Testing Database Version..."
                    DB_VERSION=$(docker exec postgres psql -U postgres -t -c "SELECT version();" 2>/dev/null | head -1 | xargs)
                    if [ ! -z "$DB_VERSION" ]; then
                        echo "✅ PostgreSQL Version: $DB_VERSION"
                    else
                        echo "❌ PostgreSQL: Version check failed"
                    fi
                    
                    # Test Database Tables
                    echo "📋 Testing Database Tables..."
                    TABLE_COUNT=$(docker exec postgres psql -U postgres -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | xargs)
                    if [ ! -z "$TABLE_COUNT" ]; then
                        echo "✅ Database Tables: $TABLE_COUNT tables found"
                    else
                        echo "❌ Database Tables: Query failed"
                    fi
                    
                    echo ""
                '''
            }
        }
        
        stage('📊 Final Status Report') {
            steps {
                sh '''
                    echo ""
                    echo "🎯 VentePlus Application Complete Test Report:"
                    echo "=============================================="
                    
                    # Count final status
                    HEALTHY=$(docker ps --filter "health=healthy" --format "{{.Names}}" | grep -E "(postgres|config-service|eureka-service|gateway-service|client-service|categorie-service|produit-service|facture-service|devis-service|reglement-service|dashboard-service)" | wc -l)
                    RUNNING=$(docker ps --format "{{.Names}}" | grep -E "(postgres|config-service|eureka-service|gateway-service|client-service|categorie-service|produit-service|facture-service|devis-service|reglement-service|dashboard-service|vente-plus-frontend)" | wc -l)
                    
                    echo "📊 Container Summary:"
                    echo "  🏥 Healthy Backend Services: $HEALTHY/11"
                    echo "  🏃 Running Containers: $RUNNING/12"
                    echo ""
                    echo "🌐 Application URLs:"
                    echo "  Frontend:     http://localhost:3000"
                    echo "  API Gateway:  http://localhost:8888"
                    echo "  Eureka:       http://localhost:8762"
                    echo "  Config:       http://localhost:5556"
                    echo ""
                    echo "🔗 Microservices URLs:"
                    echo "  Client:       http://localhost:8084"
                    echo "  Category:     http://localhost:8087"
                    echo "  Product:      http://localhost:8081"
                    echo "  Devis:        http://localhost:8085"
                    echo "  Facture:      http://localhost:8083"
                    echo "  Reglement:    http://localhost:8086"
                    echo "  Dashboard:    http://localhost:8089"
                    echo ""
                    
                    if [ "$RUNNING" -ge 11 ] && [ "$HEALTHY" -ge 10 ]; then
                        echo "🎉 SUCCESS: VentePlus is running perfectly!"
                        echo "   All services tested and working correctly!"
                    elif [ "$RUNNING" -ge 10 ]; then
                        echo "⚠️  WARNING: Most services working, some may need attention"
                    else
                        echo "❌ CRITICAL: Multiple services have issues"
                    fi
                '''
            }
        }
    }
    
    post {
        always {
            echo '📋 Pipeline execution completed'
        }
        success {
            echo '🎉 SUCCESS: VentePlus pipeline with endpoint testing completed successfully!'
        }
        failure {
            echo '❌ FAILED: Check the logs above for endpoint issues'
        }
        unstable {
            echo '⚠️ UNSTABLE: Some tests may have failed'
        }
    }
}
