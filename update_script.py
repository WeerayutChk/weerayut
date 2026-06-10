import re

with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace generateProjectUI logic
old_gen_ui = '''            // ดึงคำอธิบายจากตัวแปร PROJECT_DETAILS ถ้าไม่มีให้ใส่ข้อความว่างๆ
            const description = (PROJECT_DETAILS[category] && PROJECT_DETAILS[category][folderName]) || "";

            // Push to projectsData for Lightbox compatibility
            projectsData.push({
                key: safeKey,
                folderName: folderName,
                title_th: folderName, // Use folder name as title
                title_en: folderName, // Use folder name as title
                desc_th: description, // Pass description to lightbox mapping
                desc_en: description, // Pass description to lightbox mapping
                images: imagesArray,
                imagesCount: imagesCount
            });'''

new_gen_ui = '''            const projData = (PROJECT_DETAILS[category] && PROJECT_DETAILS[category][folderName]) || {};
            const desc_th = typeof projData === 'string' ? projData : (projData.desc_th || "");
            const title_th = typeof projData === 'string' ? folderName : (projData.title_th || folderName);
            const title_en = typeof projData === 'string' ? folderName : (projData.title_en || folderName);
            const desc_en = typeof projData === 'string' ? desc_th : (projData.desc_en || desc_th);

            // Push to projectsData for Lightbox compatibility
            projectsData.push({
                key: safeKey,
                folderName: folderName,
                title_th: title_th,
                title_en: title_en,
                desc_th: desc_th,
                desc_en: desc_en,
                images: imagesArray,
                imagesCount: imagesCount
            });'''

content = content.replace(old_gen_ui, new_gen_ui)

# Replace the HTML generation inside generateProjectUI
old_html_gen = '''                        <h5 class="project-title freelance-desc" id="proj-${safeKey}-title" style="margin-bottom:0.5rem; font-size: 1.05rem;">${folderName}</h5>
                        <!-- Empty area for description -->
                        <p class="project-short-desc" id="desc-${safeKey}" style="margin-bottom: 1rem; color: var(--tertiary); font-size: 0.95rem;">${description}</p>'''

new_html_gen = '''                        <h5 class="project-title freelance-desc" id="proj-${safeKey}-title" style="margin-bottom:0.5rem; font-size: 1.05rem;">${currentLanguage === 'en' ? title_en : title_th}</h5>
                        <!-- Empty area for description -->
                        <p class="project-short-desc" id="desc-${safeKey}" style="margin-bottom: 1rem; color: var(--tertiary); font-size: 0.95rem;">${currentLanguage === 'en' ? desc_en : desc_th}</p>'''

content = content.replace(old_html_gen, new_html_gen)

# Replace applyLanguage
old_apply_lang = '''    // Location Text
    document.getElementById("location-text").textContent = dict["location-text"];'''

new_apply_lang = '''    // Location Text
    document.getElementById("location-text").textContent = dict["location-text"];

    // Update dynamically generated projects
    if (typeof projectsData !== 'undefined') {
        projectsData.forEach(proj => {
            const titleEl = document.getElementById(`proj-${proj.key}-title`);
            const descEl = document.getElementById(`desc-${proj.key}`);
            if (titleEl) titleEl.innerHTML = proj[`title_${lang}`];
            if (descEl) descEl.innerHTML = proj[`desc_${lang}`];
        });
    }'''

content = content.replace(old_apply_lang, new_apply_lang)

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updates applied to script.js")
