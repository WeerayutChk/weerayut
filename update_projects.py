import json
import re

with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# We need to replace the `PROJECT_DETAILS` dictionary with the structured one.

new_project_details = """const PROJECT_DETAILS = {
    // ==========================================
    // 🏢 หมวดผลงานบริษัท (Donaus R&D)
    // ==========================================
    "donaus": {
        "ชุดเก็บข้อมูลการใช้พลังงานในอาคาร": {
            desc_th: "ชุดเก็บบันทึกการใช้พลังงานภายในอาคาร เพื่อนำไปวิเคราะห์ขนาดของแบตเตอรี่ กำลังไฟฟ้าขั้นต่ำที่จะติดตั้ง และวางแผนการติดตั้งโซล่าเซลล์ให้เหมาะสมกับการใช้งาน",
            title_en: "Building Energy Monitoring System",
            desc_en: "A building energy consumption monitoring system used to analyze optimal battery sizing, minimum power requirements, and solar panel installation planning."
        },
        "ปรับปรุงระบบไฟโซล่าเซลสวนหลวง ร.9": {
            desc_th: "ปรับปรุงระบบควบคุมพลังงาน และจัดทำหน้า Dashboard สำหรับควบคุมการเปิดปิดไฟส่องสว่างของสวนหลวง ร.9",
            title_en: "Suan Luang Rama IX Solar Lighting System Upgrade",
            desc_en: "Upgraded the energy control system and developed a monitoring Dashboard for controlling the solar lighting network at Suan Luang Rama IX public park."
        },
        "รถจักรยานยนต์ไฟฟ้า": {
            desc_th: "วิจัย ออกแบบ และพัฒนาเฟิร์มแวร์ระบบควบคุมการเปิดปิดรถไฟฟ้าแบบ Key-less ระบบติดตามด้วย GPS และระบบจัดกาการรสลับใช้งานแบตเตอรี่ในระหว่างเดินทาง",
            title_en: "Electric Motorcycle Development",
            desc_en: "Researched, designed, and developed firmware for key-less EV ignition systems, GPS tracking, and an automated battery-swapping management system during transit."
        },
        "รถรางนำเที่ยว และรถสามล้อไฟฟ้า เทศบาลเมืองน่าน": {
            desc_th: "ออกแบบชุดจอแสดงผลชื่อสถาณี จัดทำ Firmware จอแสดงผลเรือนไมล์แบบ LCD ระบบ GPS ติดตามตำแหน่งรถ วางระบบควบคุมยานยนต์ไฟฟ้า และเว็บแอพพลิเคชัน สำหรับติดตามรถรับส่งนักท่องเที่ยวในเขตเมืองเก่า จังหวัดน่าน",
            title_en: "Nan Municipality Electric Tram and E-Tricycle",
            desc_en: "Designed the station display module, LCD instrument cluster firmware, GPS tracking system, EV control architecture, and web application for tracking tourist shuttles in Nan Old City."
        },
        "ระบบแสดงผลสภาพอากาศ และการพลังงาน": {
            desc_th: "ออกแบบและติดตั้งระบบแสดงผลสภาพอากาศ และการพลังงาน สำหรับโรงพยาบาลส่งเสริมสุขภาพตำบลบ้านขะจาว",
            title_en: "Weather and Energy Display System",
            desc_en: "Designed and installed a weather condition and energy consumption display dashboard for Ban Kha Chao Health Promoting Hospital."
        },
        "รถรางไฟฟ้าแห่กระทง มช": {
            desc_th: "พัฒนาระบบขับเคลื่อนไฟฟ้าและการควบคุมพลังงานของรถรางประดับขบวนแห่กระทง มหาวิทยาลัยเชียงใหม่",
            title_en: "CMU Electric Parade Tram",
            desc_en: "Developed the electric drivetrain and energy management system for the illuminated parade tram used in Chiang Mai University's Loy Krathong festival."
        },
        "ระบบพ่นละอองน้ำ ด่านเก็บค่าผ่านทาง": {
            desc_th: "ออกแบบและติดตั้งระบบพ่นละอองน้ำ พร้อมจอแสดงผลค่าฝุ่น PM10 และ PM2.5 ติดตั้งที่ด่านเก็บค่าผ่านทางพิเศษ จำนวน 6 ด่าน พร้อมระบบแสดงผลผ่านจอ LCD ขนาดใหญ่ที่ศูนย์ควบคุมทางพิเศษ",
            title_en: "Tollway PM2.5 Water Spray System",
            desc_en: "Designed and installed automated water spray systems with PM10 & PM2.5 sensor displays across 6 toll plazas, including a centralized LCD monitoring dashboard at the control center."
        },
        "ระบบกล้อง AI อ่านป้ายทะเบียน": {
            desc_th: "พัฒนาระบบตรวจสอบการเข้าออก โดยใช้หน่วยประมวลผลขนาดเล็กเชื่อมต่อกับโมดูลกล้อง และรันโมเดล AI แสดงผลผ่าน Dashboard ควบคุมผ่านระบบ Remote Desktop และเว็บแอพพลิเคชัน",
            title_en: "AI License Plate Recognition Camera System",
            desc_en: "Developed an access control system utilizing an edge processor and camera module. Runs an AI model to detect license plates, with dashboard visualization and control via Remote Desktop and Web Applications."
        },
        "ระบบกล้อง AI บันทึกข้อมูล ด่านเก็บค่าผ่านทางพรมแดน แม่สอด 2": {
            desc_th: "พัฒนาระบบบันทึก และสรุปข้อมูลจำนวนการเข้าออก พร้อมควบคุมการทำงานของไม้กั้น โดยใช้หน่วยประมวลผลขนาดเล็กเชื่อมต่อกับโมดูลกล้อง และรันโมเดล AI อ่านป้ายทะเบียน และชนิดของรถบรรทุก แสดงผลผ่าน Dashboard ควบคุมผ่านระบบ Remote Desktop และเว็บแอพพลิเคชัน",
            title_en: "Mae Sot 2 Border Tollway AI Data Logging Camera System",
            desc_en: "Developed a traffic logging and boom barrier control system using an edge processor and camera. Features an AI model to read license plates and classify truck types, providing data insights via a Web Application Dashboard."
        },
        "ระบบโซล่าเซลร่วมกับแบตเตอรี่รถไฟฟ้า": {
            desc_th: "ปรับปรุงแบบเตอรี่ และเพิ่มรูปแบบการเชื่อมต่อของชุดแบตเตอรี่รถไฟฟ้า เพื่อให้สามารถใช้งานร่วมกันกับ Inverter ได้",
            title_en: "EV Battery integration with Solar Inverter System",
            desc_en: "Modified EV battery architectures and connection topologies to make them compatible with standard solar inverter systems for stationary energy storage."
        }
    },

    // ==========================================
    // 💻 หมวดงานอิสระ (Freelance Developer)
    // ==========================================
    "freelance": {
        "จัดทำ Firmware จอแสดงผล": {
            desc_th: "ออกแบบและจัดทำ Firmware เพื่อรับและแสดงผลข้อมูลจาก API ; บริษัท ไอเดีย เฮ้าส์ เซ็นเตอร์ จำกัด",
            title_en: "Display Screen Firmware Development",
            desc_en: "Designed and developed custom firmware to fetch and render data from external APIs. Client: Idea House Center Co., Ltd."
        },
        "ชุดเกมฝึกการทรงตัว เวชศาสตร์ฟื้นฟู": {
            desc_th: "ออกแบบและจัดทำ ชุดอุปกรณ์ฐานรับน้ำหนัก ระบบรับส่งข้อมูลผ่านคลื่นวิทยุ ชุดเซ็นเซอร์ Gyroscope และเกม 3D สำหรับทดสอบสมรรถภาพ และฝึกการทรงตัว ของผู้ป่วยกายภาพบำบัด; ศูนย์เวชศาสตร์ฟื้นฟู",
            title_en: "Rehabilitation Balance Training Game System",
            desc_en: "Designed a weight-bearing platform with RF wireless communication, Gyroscope sensors, and a 3D interactive game for testing and training physical therapy patients' balance. Client: Rehabilitation Center."
        },
        "ชุดเซ็นเซอร์ตรวจวัดคุณภาพน้ำ": {
            desc_th: "ออกแบบและจัดทำ ชุดเซ็นเซอร์วัดทดสอบคุณภาพน้ำ ส่งข้อมูลขึ้น Cloud ติดตั้งที่เรือสำรวจอัตโนมัติกรมชลประทาน กรุงเทพมหานคร; บริษัท เพชรหิรัญ เอ็นจิเนียริ่ง เซอร์วิส จำกัด",
            title_en: "Water Quality Sensor System",
            desc_en: "Designed and built a water quality testing sensor module with Cloud data transmission, installed on the Royal Irrigation Department's autonomous survey boats in Bangkok. Client: Petchhirun Engineering Service Co., Ltd."
        },
        "ระบบ Smart Farm เพาะเลี้ยงหนอนแมลงวันลายเสือ": {
            desc_th: "ออกแบบและจัดทำ ชุดอุปกรณ์พร้อมเซ็นเซอร์และระบบควบคุมผ่าน Dashboard สำหรับการวิจัยการเพาะเลี้ยงหนอนแมลงวันลายเสือด้วยระบบ IoT; วิทยาลัยนานาชาตินวัตกรรมดิจิทัล",
            title_en: "BSF Smart Farm Cultivation System",
            desc_en: "Engineered sensor equipment and a Dashboard control system for IoT-based research on Black Soldier Fly (BSF) larvae cultivation. Client: International College of Digital Innovation."
        },
        "ระบบ Smart Power Station": {
            desc_th: "ออกแบบและจัดทำ ตู้ควบคุมระบบพลังงานไฟฟ้าสำหรับลานจอดรถขนตู้คอนเทรนเนอร์แช่เย็น รับส่งข้อมูลคำสั่งตัดไฟ และปริมาณการใช้พลังงานแบบออนไลน์ผ่านเว็บแอพพลิเคชัน; บริษัท ตองแปด โลจิสติกส์ จำกัด",
            title_en: "Smart Power Station Control System",
            desc_en: "Designed and built an electrical power control cabinet for refrigerated container parking lots. Features remote power cutoff and online energy consumption monitoring via a Web Application. Client: Tongpad Logistics Co., Ltd."
        }
    }
};"""

start_str = "const PROJECT_DETAILS = {"
end_str = "};\n\nconst projectsData ="
start_idx = content.find(start_str)
end_idx = content.find(end_str)

if start_idx != -1 and end_idx != -1:
    content = content[:start_idx] + new_project_details + content[end_idx + 2:]
    with open('script.js', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Successfully replaced PROJECT_DETAILS")
else:
    print("Could not find PROJECT_DETAILS block bounds")
