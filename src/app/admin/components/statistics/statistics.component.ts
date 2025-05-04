import { Component, OnInit } from '@angular/core';

interface Statistics {
  totalMovies: number;
  showingMovies: number;
  upcomingMovies: number;
  totalTicketsSold: number;
  totalRevenue: number; // Doanh thu (VND)
  recentMovies: { title: string; releaseDate: string }[];
}

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent implements OnInit {
  stats: Statistics = {
    totalMovies: 0,
    showingMovies: 0,
    upcomingMovies: 0,
    totalTicketsSold: 0,
    totalRevenue: 0,
    recentMovies: []
  };

  ngOnInit(): void {
    // Giả lập gọi API
    this.fetchStatistics();
  }

  fetchStatistics(): void {
    // Dữ liệu giả lập (thay thế bằng API thật sau)
    const fakeApiResponse: Statistics = {
      totalMovies: 150,
      showingMovies: 90,
      upcomingMovies: 60,
      totalTicketsSold: 12500,
      totalRevenue: 3750000000, // 3.75 tỷ VND
      recentMovies: [
        { title: 'The Matrix Resurrections', releaseDate: '2021-12-22' },
        { title: 'Dune: Part Two', releaseDate: '2024-03-01' },
        { title: 'Avatar 3', releaseDate: '2025-12-19' }
      ]
    };

    this.stats = fakeApiResponse;
  }

  // Định dạng tiền tệ VND
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  }
}