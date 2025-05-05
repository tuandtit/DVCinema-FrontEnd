import { Component } from '@angular/core';

@Component({
    selector: 'app-admin-dashboard',
    templateUrl: './admin-dashboard.component.html',
    styleUrls: ['./admin-dashboard.component.scss'],
    standalone: false
})
export class AdminDashboardComponent {
  startDate: string = '';
  endDate: string = '';
  selectedRange: string = '';

  stats = {
    ticketsSold: 0,
    revenue: 0,
    moviesShowing: 0,
    newUsers: 0,
  };

  topMovies = [
    { name: 'Godzilla x Kong', revenue: 50000000 },
    { name: 'Inside Out 2', revenue: 43500000 },
  ];
  lowRiskShowtimes = [
    { time: '10:30', movie: 'Inside Out 2' },
    { time: '11:00', movie: 'Godzilla x Kong' },
    { time: '12:15', movie: 'Movie C' },
    { time: '13:45', movie: 'Movie D' },
  ];

  userBehavior = {
    peakHours: '18:00 – 21:00',
    device: 'Mobile',
    location: 'Ho Chi Minh City',
  };

  timeRanges = [
    { label: 'Hôm nay', value: 'today' },
    { label: 'Hôm qua', value: 'yesterday' },
    { label: 'Tuần này', value: 'this_week' },
    { label: 'Tuần trước', value: 'last_week' },
    { label: 'Tháng này', value: 'this_month' },
    { label: 'Tháng trước', value: 'last_month' },
  ];

  onTimeRangeChange() {
    switch (this.selectedRange) {
      case 'today':
        this.stats = {
          ticketsSold: 2154,
          revenue: 122000000,
          moviesShowing: 18,
          newUsers: 56,
        };
        this.topMovies = [
          { name: 'Godzilla x Kong', revenue: 50000000 },
          { name: 'Inside Out 2', revenue: 43500000 },
        ];
        break;
      case 'yesterday':
        this.stats = {
          ticketsSold: 1890,
          revenue: 98000000,
          moviesShowing: 16,
          newUsers: 42,
        };
        this.topMovies = [
          { name: 'Dune 2', revenue: 40000000 },
          { name: 'Kung Fu Panda 4', revenue: 37000000 },
        ];
        break;
      case 'this_week':
        this.stats = {
          ticketsSold: 10340,
          revenue: 610000000,
          moviesShowing: 20,
          newUsers: 210,
        };
        this.topMovies = [
          { name: 'Inside Out 2', revenue: 180000000 },
          { name: 'Godzilla x Kong', revenue: 160000000 },
        ];
        break;
      case 'last_week':
        this.stats = {
          ticketsSold: 9800,
          revenue: 578000000,
          moviesShowing: 19,
          newUsers: 198,
        };
        this.topMovies = [
          { name: 'Dune 2', revenue: 150000000 },
          { name: 'Kung Fu Panda 4', revenue: 145000000 },
        ];
        break;
      case 'this_month':
        this.stats = {
          ticketsSold: 40450,
          revenue: 2480000000,
          moviesShowing: 28,
          newUsers: 840,
        };
        this.topMovies = [
          { name: 'Godzilla x Kong', revenue: 600000000 },
          { name: 'Inside Out 2', revenue: 520000000 },
        ];
        break;
      case 'last_month':
        this.stats = {
          ticketsSold: 39100,
          revenue: 2350000000,
          moviesShowing: 26,
          newUsers: 800,
        };
        this.topMovies = [
          { name: 'Dune 2', revenue: 590000000 },
          { name: 'Kung Fu Panda 4', revenue: 480000000 },
        ];
        break;
      default:
        this.stats = {
          ticketsSold: 0,
          revenue: 0,
          moviesShowing: 0,
          newUsers: 0,
        };
        this.topMovies = [];
    }
  }

  applyDateFilter() {
    console.log('Lọc từ ngày:', this.startDate, 'đến:', this.endDate);

    // Reset preset
    this.selectedRange = '';

    // Fake dữ liệu thủ công
    this.stats = {
      ticketsSold: 1234,
      revenue: 83000000,
      moviesShowing: 15,
      newUsers: 30,
    };

    this.topMovies = [
      { name: 'Kung Fu Panda 4', revenue: 30000000 },
      { name: 'Dune 2', revenue: 27000000 },
    ];
  }
}
