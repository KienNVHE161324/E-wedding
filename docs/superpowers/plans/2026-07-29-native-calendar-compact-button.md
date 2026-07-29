# Native Calendar Compact Button Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Google Calendar links with downloadable `.ics` events and make each timeline calendar button compact.

**Architecture:** Keep calendar serialization in `src/lib/invitation/lich.ts` as pure functions so it can be tested independently and used during server rendering. The timeline component consumes a data URL and safe filename from those helpers, then renders a compact native download link without a new tab.

**Tech Stack:** Next.js 16.2.12 App Router, React 19.2.4, TypeScript 5, Tailwind CSS 4, Vitest, Testing Library.

## Global Constraints

- The button is a small pill with a calendar icon and the exact label `Thêm vào lịch`.
- The event lasts two hours and uses `Asia/Ho_Chi_Minh`.
- The `.ics` event includes the name and optional location.
- The browser and operating system choose the compatible calendar application.
- No Google Calendar URL, new tab, API route, or new dependency.
- Read the relevant installed Next.js guide before production changes, as required by `AGENTS.md`.

---

### Task 1: iCalendar serialization and download metadata

**Files:**
- Modify: `src/lib/invitation/lich.ts`
- Test: `src/lib/invitation/__tests__/lich.test.ts`

**Interfaces:**
- Consumes: `SuKien` from `src/lib/invitation/types.ts`.
- Produces: `noiDungIcs(suKien: SuKien): string`, `lienKetThemVaoLich(suKien: SuKien): string`, and `tenTepLich(suKien: SuKien): string`.

- [ ] **Step 1: Read the installed Next.js linking guide**

Run:

```powershell
Get-Content -Raw node_modules\next\dist\docs\01-app\01-getting-started\04-linking-and-navigating.md
```

Confirm that a plain `<a>` remains appropriate for a downloadable non-page resource.

- [ ] **Step 2: Replace the Google-specific test with failing iCalendar tests**

Update `src/lib/invitation/__tests__/lich.test.ts` to import all three produced functions and assert:

```ts
const suKien = {
  ngay: '2026-11-14',
  gio: '09:00',
  ten: 'Lễ Vu Quy, nhà gái',
  diaDiem: 'Tư gia; tầng 2',
}
const ics = noiDungIcs(suKien)

expect(ics).toContain('BEGIN:VCALENDAR\r\n')
expect(ics).toContain('DTSTART;TZID=Asia/Ho_Chi_Minh:20261114T090000')
expect(ics).toContain('DTEND;TZID=Asia/Ho_Chi_Minh:20261114T110000')
expect(ics).toContain('SUMMARY:Lễ Vu Quy\\, nhà gái')
expect(ics).toContain('LOCATION:Tư gia\\; tầng 2')
expect(ics).toContain('\r\nEND:VCALENDAR')
expect(lienKetThemVaoLich(suKien)).toMatch(/^data:text\/calendar;charset=utf-8,/)
expect(decodeURIComponent(lienKetThemVaoLich(suKien).split(',')[1])).toBe(ics)
expect(tenTepLich(suKien)).toBe('le-vu-quy-nha-gai-2026-11-14.ics')
```

Add a second assertion that omitting `diaDiem` omits the `LOCATION` line.

- [ ] **Step 3: Run the focused test and verify RED**

Run:

```powershell
npm test -- src/lib/invitation/__tests__/lich.test.ts
```

Expected: FAIL because `noiDungIcs` and `tenTepLich` are not exported and the existing link still targets Google Calendar.

- [ ] **Step 4: Implement the smallest standards-compliant serializer**

In `src/lib/invitation/lich.ts`:

- replace `mocGoogle` with a local date formatter that adds minutes using UTC arithmetic without converting the wall-clock values to another timezone;
- escape backslash, newline, comma, and semicolon in text values;
- build `VCALENDAR`/`VEVENT` lines with CRLF;
- include a deterministic `UID`, `DTSTART`, `DTEND`, `SUMMARY`, and optional `LOCATION`;
- return `data:text/calendar;charset=utf-8,${encodeURIComponent(noiDungIcs(suKien))}`;
- normalize the event name with Unicode NFD, remove combining marks, replace non-alphanumeric runs with hyphens, and append the ISO date plus `.ics`.

- [ ] **Step 5: Run the focused test and verify GREEN**

Run:

```powershell
npm test -- src/lib/invitation/__tests__/lich.test.ts
```

Expected: PASS with no warnings.

- [ ] **Step 6: Commit Task 1**

```powershell
git add src/lib/invitation/lich.ts src/lib/invitation/__tests__/lich.test.ts
git commit -m "feat: tao tep lich ics cho su kien"
```

### Task 2: Compact calendar download button

**Files:**
- Modify: `src/components/sections/SuKien.tsx`
- Test: `src/components/sections/__tests__/SuKien.test.tsx`

**Interfaces:**
- Consumes: `lienKetThemVaoLich(suKien: SuKien): string` and `tenTepLich(suKien: SuKien): string`.
- Produces: one compact downloadable calendar link per timeline event.

- [ ] **Step 1: Write the failing component test**

Change the calendar-link test to query `Thêm vào lịch` and assert:

```ts
expect(nut).toHaveLength(thiepMau.suKien.length)
expect(nut[0]).toHaveAttribute('href', expect.stringMatching(/^data:text\/calendar/))
expect(nut[0]).toHaveAttribute('download', expect.stringMatching(/\.ics$/))
expect(nut[0]).not.toHaveAttribute('target')
expect(nut[0].className).toContain('px-3')
expect(nut[0].className).toContain('py-1.5')
expect(nut[0].querySelector('svg')).toBeInTheDocument()
expect(nut[0].getAttribute('href')).not.toContain('calendar.google.com')
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```powershell
npm test -- src/components/sections/__tests__/SuKien.test.tsx
```

Expected: FAIL because the label, download metadata, icon, and compact spacing are not implemented.

- [ ] **Step 3: Implement the compact link**

In `src/components/sections/SuKien.tsx`:

- import `tenTepLich`;
- remove `target` and `rel`;
- set `download={tenTepLich(sk)}`;
- change classes to `mt-2 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition hover:-translate-y-0.5 hover:shadow-md`;
- add an inline decorative calendar SVG with `aria-hidden="true"`, `h-3.5 w-3.5`, `viewBox="0 0 24 24"`, and `fill="none"`;
- change the visible label to `Thêm vào lịch`.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run:

```powershell
npm test -- src/components/sections/__tests__/SuKien.test.tsx
```

Expected: PASS with no warnings.

- [ ] **Step 5: Run repository verification**

Run:

```powershell
npm test
npm run lint
npm run build
```

Expected: all commands exit 0.

- [ ] **Step 6: Verify the mobile rendering**

Start the development server and inspect the invitation at a phone-sized viewport. Confirm the pill is visibly smaller, stays aligned under each event, preserves a comfortable tap target, and does not overflow.

- [ ] **Step 7: Commit Task 2**

```powershell
git add src/components/sections/SuKien.tsx src/components/sections/__tests__/SuKien.test.tsx
git commit -m "feat: thu gon nut them vao lich"
```
