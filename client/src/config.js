module.exports = {
  bubbleRadius:10,
  drawerWidth: 240,
  navItems: ['Home', 'About', 'Contact'],
  axis: [{ id: 1, value: 'apl', axis: 'last apl' }, { id: 2, value: 'razi', axis: 'last razi' }, { id: 3, value: 'apl&razi', axis: 'last apl + razi' }, { id: 4, value: 'performance', axis: 'last performance evaluation' }],
  chartConfig: {
    maintainAspectRatio: true,
    responsive: true,
    interaction: {
      mode: 'nearest'
    },
    layout: {
      autoPadding: true,
    },
    plugins: {
      datalabels: {
        font: {
          size: 15,
          weight: 300
        },
        color: (context, args) => {
          return '#fff';
        },
      },
      legend: {
        display: false
      },
      title: {
        display: true
      },
      tooltip: {
        callbacks: {
          label: (tooltipItems) => {
            return (tooltipItems.raw?.name?.can_nombre +" " +tooltipItems.raw?.name?.can_apellido) || tooltipItems.raw?.label;
          }
        }
      }
    },
    scales: {
      x: {
        title: { display: false, },
        beginAtZero: true,
        grid: {
          display: false,
        },
        ticks: {
          display: false,
        },
        border: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        title: { display: false, },
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
        ticks: {
          display: false,
        }
      }
    }
  }

}