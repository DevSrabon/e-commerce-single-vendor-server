pipeline {
    agent any
    tools { nodejs 'Node' }
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
                script {
                    def appName = "server" // Replace with your actual app name
                    def isRunning = sh(script: "pm2 list | grep ${appName}", returnStatus: true) == 0

                    if (isRunning) {
                        echo 'Restarting application...'
                        sh "pm2 restart ${appName} --update-env"
                    } else {
                        echo 'Starting application...'
                        sh "pm2 start dist/server.js --name ${appName} --update-env"
                    }
                }
            }
        }
    }
}
