Database: SQLite (farm.db)
Location: /data/farm.db (auto-created)

Tables:
  users              - Auth accounts
  farms              - Farm profiles (1 per user)
  crops              - Crops per farm
  devices            - ESP32/IoT devices per farm
  sensor_readings    - All sensor data
  alerts             - Farm alerts
  recommendations    - Rule-based advice
  price_data         - Daily crop prices
  price_predictions  - Cached prediction results
  crop_scans         - Image scan history

To seed demo data:
  cd server && node db/seed.js

Demo login:
  Email:    demo@farm.com
  Password: demo1234
