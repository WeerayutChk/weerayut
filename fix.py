import sys

with open('e:\\Other\\work_process\\Web_Resume\\index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

donaus_idx = -1
innoedge_idx = -1
portfolio_idx = -1
freelance_idx = -1
end_idx = -1

for i, line in enumerate(lines):
    if '<!-- COMPANY 2: DONAUS' in line and donaus_idx == -1:
        donaus_idx = i
    if '<!-- COMPANY 1: INNOEDGE GOGO' in line and innoedge_idx == -1:
        innoedge_idx = i
    if '<!-- PORTFOLIO TIMELINE ITEM -->' in line and portfolio_idx == -1:
        portfolio_idx = i
    if '<!-- FREELANCE PROJECTS GRID -->' in line and freelance_idx == -1:
        freelance_idx = i
    if '</div>' in line and '        </section>' in lines[min(i+1, len(lines)-1)] and freelance_idx != -1 and end_idx == -1:
        end_idx = i

if -1 in [donaus_idx, innoedge_idx, portfolio_idx, freelance_idx, end_idx]:
    print("Could not find all indices")
    sys.exit(1)

# Extract sections
donaus = lines[donaus_idx:innoedge_idx]
innoedge = lines[innoedge_idx:portfolio_idx]
portfolio = lines[portfolio_idx:freelance_idx]
freelance = lines[freelance_idx:end_idx]

# Delete any duplicated blocks that might be further down in the file
# We'll just construct the new file from scratch up to end_idx + 1, and then scan for any garbage at the end
# Wait, let's just grab the prefix and suffix cleanly.
# The prefix is lines[0:donaus_idx].
# The suffix starts from end_idx.
prefix = lines[:donaus_idx]
# Find the real suffix: it should be '            </div>\n        </section>\n\n\n\n        <!-- EDUCATION & LANGUAGE SECTION -->'
suffix_start = end_idx
# To be absolutely sure we don't include duplicates, let's look for '<!-- EDUCATION & LANGUAGE SECTION -->'
edu_idx = -1
for i, line in enumerate(lines):
    if '<!-- EDUCATION & LANGUAGE SECTION -->' in line:
        edu_idx = i
        break

if edu_idx != -1:
    suffix = lines[edu_idx-3:] # grab a few blank lines before it
else:
    suffix = lines[end_idx:]

new_lines = prefix + portfolio + freelance + donaus + innoedge + ['            </div>\n', '        </section>\n'] + suffix

with open('e:\\Other\\work_process\\Web_Resume\\index.html', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
print("Fixed successfully")
