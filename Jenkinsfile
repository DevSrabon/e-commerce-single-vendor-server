pipeline {
    agent any
    tools { nodejs 'Node' } // Specify the Node.js installation name in Jenkins
    stages {
        stage('Install') {
            steps {
                echo 'Installing dependencies...'
                sh 'npm install'
            }
        }
        stage('Build') {
            steps {
                echo 'Building project...'
                sh 'npx tsc'
            }
        }
        stage('Deploy') {
            steps {
                echo 'Deploying application...'
                sh 'pm2 restart all'
            }
        }
    }
}
