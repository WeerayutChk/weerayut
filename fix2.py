import sys

with open('e:\\Other\\work_process\\Web_Resume\\index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

donaus_idx = -1
innoedge_idx = -1
portfolio_idx = -1
freelance_idx = -1
end_idx = -1

for i, line in enumerate(lines):
    if '<!-- COMPANY 2: DONAUS' in line: donaus_idx = i
    if '<!-- COMPANY 1: INNOEDGE GOGO' in line: innoedge_idx = i
    if '<!-- PORTFOLIO TIMELINE ITEM -->' in line: portfolio_idx = i
    if '<!-- FREELANCE PROJECTS GRID -->' in line: freelance_idx = i
    if '<!-- EDUCATION & LANGUAGE SECTION -->' in line: end_idx = i

# End of timeline is some lines before EDUCATION & LANGUAGE SECTION
# We can just look backwards from end_idx for </section>
for i in range(end_idx, -1, -1):
    if '</section>' in lines[i]:
        timeline_end = i
        break

# Extract the chunks
donaus = lines[donaus_idx:innoedge_idx]
innoedge = lines[innoedge_idx:portfolio_idx]
portfolio = lines[portfolio_idx:freelance_idx]
freelance = lines[freelance_idx:timeline_end-1] # -1 to avoid grabbing the closing </div>

# Fix the donaus title span inside the `donaus` array
for i, line in enumerate(donaus):
    if 'id="donaus-title">Product R&D Engineer</h3>' in line:
        donaus[i] = '''                                <h3 class="experience-title" style="display: flex; align-items: baseline; flex-wrap: wrap;">
                                    <span id="donaus-title">Product R&D Engineer</span>
                                    <span id="donaus-title-th" class="job-thai-desc" style="margin-left: 0.75rem; color: var(--text-secondary); font-family: 'Sarabun', sans-serif; font-size: 0.85em; font-weight: normal;">(วิศวกรวิจัยและพัฒนาผลิตภัณฑ์)</span>
                                </h3>\n'''

prefix = lines[:donaus_idx]
suffix = lines[timeline_end-1:]

new_lines = prefix + portfolio + freelance + donaus + innoedge + suffix

with open('e:\\Other\\work_process\\Web_Resume\\index.html', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
print("Reorder successful")
