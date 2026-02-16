// generate-report.component.ts
import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

type ReportKey = 'revenue' | 'engagement' | 'course' | 'instructor' | 'payment';

type ReportCard = {
  key: ReportKey;
  title: string;
  desc: string;
  iconSrc: string;
  iconBg: string;
};

type SeriesPoint = { label: string; value: number };

type MetricIcon = 'users' | 'clock' | 'check';
type PreviewMetric = { label: string; valueText: string; subText: string; bg: string; icon: MetricIcon };

type TableRow = { values: (string | number)[] };

type AxisConfig = {
  min: number;
  max: number;
  ticks: (string | number)[];
};

type ReportPreview = {
  title: string;

  metrics: PreviewMetric[];

  series: SeriesPoint[];
  chartLine: string;
  chartArea: string;

  donutTitle: string;
  donutRows: { name: string; value: number }[];

  tableColumns: string[];
  tableRows: TableRow[];

  // optional y-axis config (needed for Instructor rating)
  axis?: AxisConfig;
};

@Component({
  selector: 'app-generate-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './generate-report.component.html',
  styleUrl: './generate-report.component.css',
})
export class GenerateReportComponent implements OnInit {
  constructor(private location: Location) {}

  // ✅ Cards
  cards: ReportCard[] = [
    {
      key: 'revenue',
      title: 'Revenue Reports',
      desc: 'Track financial Performance and Revenue Streams',
      iconSrc: 'assets/admin/report/Revenue.svg',
      iconBg: '#EAF3FF',
    },
    {
      key: 'engagement',
      title: 'User Engagement',
      desc: 'Analyze student activity and participation metrics',
      iconSrc: 'assets/admin/report/Change.svg',
      iconBg: '#E9FFF1',
    },
    {
      key: 'course',
      title: 'Course Analytics',
      desc: 'Evaluate Course performance and popularity',
      iconSrc: 'assets/admin/report/Homework.svg',
      iconBg: '#F1E9FF',
    },
    {
      key: 'instructor',
      title: 'Instructor Performance',
      desc: 'Review instructor ratings and effectiveness',
      iconSrc: 'assets/admin/report/Driving instructor.svg',
      iconBg: '#FFF9D6',
    },
    {
      key: 'payment',
      title: 'Payment Reports',
      desc: 'Track transactions and payment processing',
      iconSrc: 'assets/admin/report/Tax.svg',
      iconBg: '#FFE7E7',
    },
  ];

  // left panel state
  active: ReportKey | null = null;

  // preview state
  showPreview = false;
  preview: ReportPreview | null = null;

  // dropdown data
  reportTypes: string[] = ['User Engagement Report', 'Revenue Summary Report', 'Payment Transactions Report'];
  categories: string[] = ['All Categories', 'Programming', 'Design', 'Business'];

  instructors: string[] = ['All Instructors', 'Emily J.', 'John Doe', 'Ronaldo', 'Jame Smith', 'Dennis Ritchie'];

  private courseMap: Record<string, string[]> = {
    'All Categories': ['All Courses', 'Python Basics', 'UI/UX Fundamentals', 'Business 101'],
    Programming: ['All Courses', 'Python Basics', 'Angular Mastery', 'Node.js Essentials'],
    Design: ['All Courses', 'UI/UX Fundamentals', 'Figma for Beginners'],
    Business: ['All Courses', 'Business 101', 'Marketing Basics'],
  };

  filteredCourses: string[] = [];

  form = {
    reportType: 'User Engagement Report',
    from: '',
    to: '',
    category: 'All Categories',
    course: 'All Courses',
    instructor: 'All Instructors',
  };

  // ===== SVG computed =====
  linePath = '';
  areaPath = '';
  points: { x: number; y: number }[] = [];
  xTicks: { x: number; label: string }[] = [];
  yTicks: (string | number)[] = [];

  // donut computed
  donutSegments: { color: string; dasharray: string; dashoffset: string }[] = [];
  donutLegend: { label: string; dot: string }[] = [];

  ngOnInit(): void {
    const today = this.toISODate(new Date());
    this.form.from = today;
    this.form.to = today;

    this.filteredCourses = this.courseMap[this.form.category] ?? ['All Courses'];
    this.form.course = this.filteredCourses[0] ?? 'All Courses';
  }

  goBack() {
    this.location.back();
  }

  open(card: ReportCard) {
    this.active = card.key;

    // reset preview
    this.showPreview = false;
    this.preview = null;

    // keep same form - only report type auto-set (like your screenshots)
    if (card.key === 'revenue') this.form.reportType = 'Revenue Summary Report';
    if (card.key === 'engagement') this.form.reportType = 'User Engagement Report';
    if (card.key === 'payment') this.form.reportType = 'Payment Transactions Report';
    if (card.key === 'course') this.form.reportType = 'User Engagement Report'; // screenshot shows this selected; keep as-is
    if (card.key === 'instructor') this.form.reportType = 'User Engagement Report'; // screenshot shows this selected; keep as-is
  }

  closeForm() {
    this.active = null;
    this.showPreview = false;
    this.preview = null;
  }

  onCategoryChange() {
    this.filteredCourses = this.courseMap[this.form.category] ?? ['All Courses'];
    this.form.course = this.filteredCourses[0] ?? 'All Courses';
  }

  applyQuickRange(type: '7' | '10' | 'month') {
    const end = new Date();
    let start = new Date();

    if (type === '7') start = this.addDays(end, -7);
    if (type === '10') start = this.addDays(end, -10);
    if (type === 'month') start = new Date(end.getFullYear(), end.getMonth() - 1, end.getDate());

    this.form.from = this.toISODate(start);
    this.form.to = this.toISODate(end);
  }

  // ✅ Generate -> preview based on selected card
  generate() {
    if (!this.active) return;

    let p: ReportPreview;

    if (this.active === 'engagement') p = this.buildEngagementPreview();
    else if (this.active === 'course') p = this.buildCourseAnalyticsPreview();
    else if (this.active === 'instructor') p = this.buildInstructorPreview();
    else if (this.active === 'payment') p = this.buildPaymentPreview(); // ✅ payment
    else p = this.buildRevenuePreview();

    this.preview = p;

    // build chart + donut visuals
    this.buildChartFromSeries(p.series, p.axis);
    this.buildDonutFromRows(p.donutRows);

    this.showPreview = true;
  }

  exportReport() {
    console.log('Export clicked', { active: this.active, form: this.form, preview: this.preview });
  }

  // =========================
  // ✅ PREVIEW BUILDERS
  // =========================

  private buildEngagementPreview(): ReportPreview {
    const activeUsers = 1400 + this.randInt(80, 260);
    const durationSec = 40 * 60 + this.randInt(0, 180);
    const completion = this.randFloat(72, 86);

    const series = this.buildSeriesMay(12, 150, 120, 10); // blue

    const donutRows = [
      { name: 'UI/UX Designing', value: 40 },
      { name: 'Data Science', value: 5 },
      { name: 'Web Development', value: 15 },
      { name: 'Artificial Intelligence', value: 10 },
      { name: 'Digital Marketing', value: 20 },
    ];

    return {
      title: 'User Engagement Report',

      metrics: [
        { label: 'Active Users', valueText: String(activeUsers), subText: 'Compared to previous period', bg: '#CFE1FF', icon: 'users' },
        { label: 'Avg. Session Duration', valueText: this.formatDuration(durationSec), subText: 'Compared to previous period', bg: '#FCE6A6', icon: 'clock' },
        { label: 'Course Completion Rate', valueText: `${completion.toFixed(1)}%`, subText: 'Compared to previous period', bg: '#F8B6D8', icon: 'check' },
      ],

      series,
      chartLine: '#1D7BFF',
      chartArea: '#D9ECFF',

      donutTitle: 'Engagement by Category',
      donutRows,

      tableColumns: ['Course', 'Students'],
      tableRows: donutRows.map((r) => ({ values: [r.name, r.value] })),
    };
  }

  private buildCourseAnalyticsPreview(): ReportPreview {
    const enrollments = 15000 + this.randInt(200, 1500);
    const completion = this.randFloat(70, 86);
    const avgRating = this.randFloat(4.3, 4.9);

    // yellow/orange chart like screenshot
    const series = this.buildSeriesMay(12, 780, 700, 16);

    const donutRows = [
      { name: 'UI/UX Designing', value: 35 },
      { name: 'Data Science', value: 14 },
      { name: 'Web Development', value: 18 },
      { name: 'Artificial Intelligence', value: 16 },
      { name: 'Digital Marketing', value: 17 },
    ];

    const tableRows: TableRow[] = [
      { values: ['UI/UX Designing', '4/5', this.randInt(8, 18)] },
      { values: ['Data Science', '4/5', this.randInt(18, 30)] },
      { values: ['Web Development', '4/5', this.randInt(10, 20)] },
      { values: ['Artificial Intelligence', '4/5', this.randInt(4, 10)] },
      { values: ['Digital Marketing', '4/5', this.randInt(10, 22)] },
    ];

    return {
      title: 'Courses  Report Preview',

      metrics: [
        {
          label: 'Total Enrollments',
          valueText: this.formatNumber(enrollments),
          subText: 'No of students enrolled in courses during the selected period.',
          bg: '#FFF3A6',
          icon: 'users',
        },
        {
          label: 'Completion Rate',
          valueText: `${completion.toFixed(1)}%`,
          subText: 'Percentage of enrolled students who completed their courses.',
          bg: '#F7C7F0',
          icon: 'clock',
        },
        {
          label: 'Average Rating',
          valueText: `${avgRating.toFixed(1)}/5.0`,
          subText: 'Avg feedback score given by students after completing courses.',
          bg: '#DCCBFF',
          icon: 'check',
        },
      ],

      series,
      chartLine: '#F5B000',
      chartArea: '#FFF2CC',

      donutTitle: 'Course Performance',
      donutRows,

      tableColumns: ['Course', 'Rating', 'Students'],
      tableRows,
    };
  }

  private buildInstructorPreview(): ReportPreview {
    const completion = this.randFloat(82, 90);
    const satisfaction = this.randFloat(88, 95);
    const avgRating = this.randFloat(4.5, 4.8);

    // rating chart (values between ~3.6 - 4.4)
    const series = this.buildSeriesMayFloat(12, 4.35, 3.75, 0.10);

    const donutRows = [
      { name: 'Emily J.', value: 26 },
      { name: 'John Doe', value: 18 },
      { name: 'Ronaldo', value: 22 },
      { name: 'Jame Smith', value: 14 },
      { name: 'Dennis Ritchie', value: 20 },
    ];

    const tableRows: TableRow[] = [
      { values: ['Emily J.', '4/5', 12, 2] },
      { values: ['John Doe', '4/5', 23, 3] },
      { values: ['Ronaldo', '4/5', 13, 1] },
      { values: ['Jame Smith', '4/5', 5, 2] },
      { values: ['Dennis Ritchie', '4/5', 16, 1] },
    ];

    return {
      title: 'Instructor Report Preview',

      metrics: [
        { label: 'Course Completion', valueText: `${completion.toFixed(0)}%`, subText: 'Percentage of students who completed courses.', bg: '#86F7B0', icon: 'users' },
        { label: 'Student Satisfaction', valueText: `${satisfaction.toFixed(0)}%`, subText: 'Percentage of students who rated the instructor 4 stars or above.', bg: '#FFE082', icon: 'clock' },
        { label: 'Average Rating', valueText: `${avgRating.toFixed(1)}/5.0`, subText: 'Average course rating received from students', bg: '#A8D0FF', icon: 'check' },
      ],

      series,
      chartLine: '#7C3AED',
      chartArea: '#E9D5FF',

      donutTitle: 'Instructor Performance',
      donutRows,

      tableColumns: ['Instructor', 'Rating', 'Students', 'Courses'],
      tableRows,

      axis: {
        min: 1,
        max: 5,
        ticks: ['5', '4.8', '4.4', '3.5', '2.5', '1'],
      },
    };
  }

  private buildPaymentPreview(): ReportPreview {
    const totalTransactions = 3842 + this.randInt(-120, 120);
    const avgTransaction = this.randFloat(130, 165);
    const successRate = this.randFloat(97.8, 99.6);

    // teal chart like screenshot (around 240-300)
    const series = this.buildSeriesMay(12, 290, 240, 10);

    // legend methods like screenshot
    const donutRows = [
      { name: 'Bank Account', value: 26 },
      { name: 'Easypaisa', value: 14 },
      { name: 'Jazzcash', value: 22 },
      { name: 'Nayapay', value: 18 },
      { name: 'Paypal', value: 20 },
    ];

    // table like screenshot
    const tableRows: TableRow[] = [
      { values: ['UI/UX Designing', 12, '99%'] },
      { values: ['Data Science', 23, '99%'] },
      { values: ['Web Development', 13, '99%'] },
      { values: ['Artificial Intelligence', 5, '99%'] },
      { values: ['Digital Marketing', 16, '99%'] },
    ];

    return {
      title: 'Payment Report Preview',

      metrics: [
        {
          label: 'Total Transactions',
          valueText: this.formatNumber(totalTransactions),
          subText: 'Total number of payment attempts made by students.',
          bg: '#F8B4B4',
          icon: 'users',
        },
        {
          label: 'Average Transaction',
          valueText: `$${avgTransaction.toFixed(2)}`,
          subText: 'Average amount paid per successful transaction.',
          bg: '#DCEBFF',
          icon: 'clock',
        },
        {
          label: 'Success Rate',
          valueText: `${successRate.toFixed(1)}%`,
          subText: 'Percentage of transactions successfully completed without errors.',
          bg: '#BFD9FF',
          icon: 'check',
        },
      ],

      series,
      chartLine: '#00C7A4',
      chartArea: '#D6FFF7',

      donutTitle: 'Payment Methods Distribution',
      donutRows,

      tableColumns: ['Payment Method', 'Transaction', 'Success Rate'],
      tableRows,
    };
  }

  private buildRevenuePreview(): ReportPreview {
    const byCourse = [
      { name: 'UI/UX Designing', value: this.randInt(180, 340) },
      { name: 'Data Science', value: this.randInt(140, 260) },
      { name: 'Web Development', value: this.randInt(160, 300) },
      { name: 'Artificial Intelligence', value: this.randInt(120, 260) },
      { name: 'Digital Marketing', value: this.randInt(150, 320) },
    ];

    const totalRevenue = byCourse.reduce((s, r) => s + r.value, 0);
    const totalTransactions = 45 + this.randInt(0, 25);
    const avgOrderValue = totalRevenue / Math.max(1, totalTransactions);

    const series = this.buildSeriesMay(12, 780, 700, 22);

    return {
      title: 'Revenue Report Preview',

      metrics: [
        { label: 'Total Revenue', valueText: this.moneyNoDecimals(totalRevenue), subText: 'Gross revenue from completed course transactions.', bg: '#CFFBDA', icon: 'users' },
        { label: 'Total Transactions', valueText: String(totalTransactions), subText: 'Number of successful course purchases completed.', bg: '#CFE4FF', icon: 'clock' },
        { label: 'Avg Order Value', valueText: this.money(avgOrderValue), subText: 'Average revenue per transaction during this period.', bg: '#E6D6FF', icon: 'check' },
      ],

      series,
      chartLine: '#3EE17B',
      chartArea: '#DFFBE7',

      donutTitle: 'Revenue by Courses',
      donutRows: byCourse,

      tableColumns: ['Course', 'Revenue'],
      tableRows: byCourse.map((r) => ({ values: [r.name, this.moneyNoDecimals(r.value)] })),
    };
  }

  // =========================
  // ✅ SERIES GENERATION
  // =========================
  private buildSeriesMay(count: number, start: number, end: number, wave: number): SeriesPoint[] {
    const out: SeriesPoint[] = [];
    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0 : i / (count - 1);
      const base = start + (end - start) * t;
      const w = Math.sin(i * 0.9) * wave;
      const noise = (Math.random() - 0.5) * (wave * 0.55);
      out.push({ label: `May ${i + 1}`, value: Math.round(base + w + noise) });
    }
    return out;
  }

  private buildSeriesMayFloat(count: number, start: number, end: number, wave: number): SeriesPoint[] {
    const out: SeriesPoint[] = [];
    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0 : i / (count - 1);
      const base = start + (end - start) * t;
      const w = Math.sin(i * 0.9) * wave;
      const noise = (Math.random() - 0.5) * (wave * 0.7);
      const v = base + w + noise;
      out.push({ label: `May ${i + 1}`, value: Number(v.toFixed(2)) });
    }
    return out;
  }

  // =========================
  // ✅ CHART BUILDER (dynamic)
  // =========================
  private buildChartFromSeries(series: SeriesPoint[], axis?: AxisConfig) {
    // viewBox: 0 0 900 260
    const left = 60;
    const right = 860;
    const top = 40;
    const bottom = 240;

    const values = series.map((s) => s.value);
    const min = Math.min(...values);
    const max = Math.max(...values);

    const vMin = axis ? axis.min : Math.max(0, min - Math.max(10, Math.round((max - min) * 0.22)));
    const vMax = axis ? axis.max : max + Math.max(10, Math.round((max - min) * 0.22));

    const n = series.length;
    const xStep = n > 1 ? (right - left) / (n - 1) : 0;

    const toY = (v: number) => {
      const t = (v - vMin) / Math.max(1e-6, vMax - vMin);
      return bottom - t * (bottom - top);
    };

    this.points = series.map((s, i) => ({ x: left + i * xStep, y: toY(s.value) }));
    this.xTicks = series.map((s, i) => ({ x: left + i * xStep, label: s.label }));

    if (axis?.ticks?.length) {
      this.yTicks = axis.ticks;
    } else {
      const tickCount = 5;
      this.yTicks = Array.from({ length: tickCount }).map((_, i) => {
        const t = i / (tickCount - 1);
        return Math.round(vMax - t * (vMax - vMin));
      });
    }

    this.linePath = this.smoothPath(this.points);
    this.areaPath = `${this.linePath} L ${right} ${bottom} L ${left} ${bottom} Z`;
  }

  private smoothPath(pts: { x: number; y: number }[]) {
    if (!pts.length) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1];
      const cur = pts[i];
      const midX = (prev.x + cur.x) / 2;
      const midY = (prev.y + cur.y) / 2;
      d += ` Q ${prev.x} ${prev.y} ${midX} ${midY}`;
    }
    const last = pts[pts.length - 1];
    d += ` T ${last.x} ${last.y}`;
    return d;
  }

  // =========================
  // ✅ DONUT BUILDER (dynamic)
  // =========================
  private buildDonutFromRows(rows: { name: string; value: number }[]) {
    const colors = ['#FFD56A', '#6EE7A6', '#60A5FA', '#E85D9C', '#FB9A3A', '#A78BFA', '#34D399'];
    const total = Math.max(1, rows.reduce((s, r) => s + r.value, 0));

    let offset = 0;
    this.donutSegments = rows.map((r, idx) => {
      const pct = (r.value / total) * 100;
      const dasharray = `${pct} ${100 - pct}`;
      const dashoffset = `-${offset}`;
      offset += pct;

      return { color: colors[idx % colors.length], dasharray, dashoffset };
    });

    this.donutLegend = rows.map((r, idx) => ({
      label: this.cleanLegend(r.name),
      dot: colors[idx % colors.length],
    }));
  }

  private cleanLegend(name: string) {
    const n = name.toLowerCase();
    if (n.includes('ui/ux')) return 'UI/UX Design';
    if (n.includes('data')) return 'Data Science';
    if (n.includes('web')) return 'Web Development';
    if (n.includes('artificial')) return 'Artificial Intelligence';
    if (n.includes('digital')) return 'Digital Marketing';
    return name;
  }

  // =========================
  // ✅ FORMAT HELPERS
  // =========================
  private randInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  private randFloat(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }
  private formatDuration(sec: number) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${String(s).padStart(2, '0')}s`;
  }
  private formatNumber(n: number) {
    return n.toLocaleString();
  }
  money(v: number) {
    return `$${v.toFixed(2)}`;
  }
  moneyNoDecimals(v: number) {
    return `$${Math.round(v)}`;
  }

  // =========================
  // ✅ DATE HELPERS
  // =========================
  private addDays(date: Date, days: number) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }
  private toISODate(d: Date) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
}
