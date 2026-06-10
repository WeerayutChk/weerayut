import sys

with open('e:\\Other\\work_process\\Web_Resume\\index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add the span back to Donaus title
old_donaus_title = '<h3 class="experience-title" id="donaus-title">Product R&D Engineer</h3>'
new_donaus_title = '''<h3 class="experience-title" style="display: flex; align-items: baseline; flex-wrap: wrap;">
                                    <span id="donaus-title">Product R&D Engineer</span>
                                    <span id="donaus-title-th" class="job-thai-desc" style="margin-left: 0.75rem; color: var(--text-secondary); font-family: 'Sarabun', sans-serif; font-size: 0.85em; font-weight: normal;">(วิศวกรวิจัยและพัฒนาผลิตภัณฑ์)</span>
                                </h3>'''
content = content.replace(old_donaus_title, new_donaus_title)

# 2. Extract the timeline items based on exact substrings
d_start = content.find('                <!-- COMPANY 2: DONAUS')
i_start = content.find('                <!-- COMPANY 1: INNOEDGE GOGO')
p_start = content.find('                <!-- PORTFOLIO TIMELINE ITEM -->')
f_start = content.find('<!-- FREELANCE PROJECTS GRID -->')

# The freelance grid ends exactly at the end of the timeline
end_timeline = content.find('            </div>\n        </section>')
if end_timeline == -1:
    end_timeline = content.find('            </div>\n        </section>'.replace('\n', '\r\n'))

# Validate indices
if d_start == -1 or i_start == -1 or p_start == -1 or f_start == -1 or end_timeline == -1:
    print('Failed to find indices', d_start, i_start, p_start, f_start, end_timeline)
    sys.exit(1)

donaus = content[d_start:i_start]
innoedge = content[i_start:p_start]
portfolio = content[p_start:f_start]
freelance = content[f_start:end_timeline]

new_content = content[:d_start] + portfolio + freelance + donaus + innoedge + content[end_timeline:]

with open('e:\\Other\\work_process\\Web_Resume\\index.html', 'w', encoding='utf-8') as f:
    f.write(new_content)
print('Success')
