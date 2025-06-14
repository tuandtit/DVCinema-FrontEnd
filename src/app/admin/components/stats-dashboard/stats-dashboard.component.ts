import { Component } from '@angular/core';

@Component({
  selector: 'app-stats-dashboard',
  templateUrl: './stats-dashboard.component.html',
  standalone: false,
})
export class StatsDashboardComponent {
  chartData: any;
  chartOptions: any;

  ngOnInit() {
    this.chartData = {
      labels: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6'],
      datasets: [
        {
          label: 'Doanh thu',
          data: [100000, 200000, 500000, 800000, 600000, 400000],
          fill: false,
          borderColor: '#42A5F5',
          tension: 0.4,
        },
        {
          label: 'Số vé',
          data: [50, 100, 250, 400, 300, 200],
          fill: false,
          borderColor: '#66BB6A',
          tension: 0.4,
        },
      ],
    };

    this.chartOptions = {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    };
  }
}
