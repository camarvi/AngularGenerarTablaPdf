import { Component, OnInit } from '@angular/core';

import { NgForm } from '@angular/forms';

import { RegistroService } from '../../services/registro.service';

import { FiltroModel} from '../../models/filtro.model';
import { DatePipe } from '@angular/common';
import jsPDF from 'jspdf';

import 'jspdf-autotable';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  listadosRegistros : any[] = [];

  filtro = new FiltroModel();

  cargando : boolean = false;

  constructor(private servicioregistro : RegistroService, public datePipe: DatePipe) {

   }

  ngOnInit(): void {

  }

  buscarRegistros(formulario : NgForm ){

    
    this.cargando = true;

    if (formulario.invalid && (Date.parse(this.filtro.desde)> Date.parse(this.filtro.hasta))) {
      // recorrer los elementos del formulario para que se dispare las validaciones
      Object.values(formulario.controls).forEach(control => {
        control.markAsTouched(); //Lo pongo como pulsado
      });

      return;
    }

    let desde = this.datePipe.transform(this.filtro.desde, 'dd.MM.yyyy');
    let hasta = this.datePipe.transform(this.filtro.hasta, 'dd.MM.yyyy');
    
    console.log("Fecha Desde Transformada");
    console.log(desde);
   
    console.log("Fecha Hasta Transformada");
    console.log(hasta);
    console.log(this.filtro);

    this.servicioregistro.getRegistrosFecha(desde,hasta).subscribe( ( data: any)=>{
      this.listadosRegistros = data;
      this.cargando = false;
    });

   
  }



generarTablaPdf(){

const header = [['Registro', 'Fecha', 'Dni', 'Ap1', 'Ap2', 'Nombre', 'Resumen', 'Destino']];
  

const tableData = [];

let nuevoRegistro = [10,'','',''];


for (i=0;i<this.listadosRegistros.length; i++) {
  nuevoRegistro = [this.listadosRegistros[i][0],
  this.datePipe.transform(this.listadosRegistros[i][2],'dd/MM/yyy'),
    this.listadosRegistros[i][3],this.listadosRegistros[i][4],this.listadosRegistros[i][5],this.listadosRegistros[i][6],this.listadosRegistros[i][7],this.listadosRegistros[i][8]];
  tableData.push(nuevoRegistro);
};
 
  var pdf = new jsPDF({
    orientation : "landscape",
  
  });
  
    pdf.setFont("courier", "bold");
    pdf.setFontSize(18);
    
    this.filtro.desde

    let titulo = "ENTRADAS DESDE : " + this.datePipe.transform( this.filtro.desde,'dd/MM/yyy') + 
    " HASTA " + this.datePipe.transform( this.filtro.hasta,'dd/MM/yyy');
    pdf.text(titulo, 55, 15);
    // Poner una linea debajo

    const textWidth =pdf.getTextWidth(titulo);
    pdf.setLineWidth(0.7);
    pdf.line(55,17, 55 + textWidth, 17);


    (pdf as any).autoTable({
        head: header,
        body: tableData,
        tableLineColor:  [44, 62, 80],
        tableLineWidth: 0.75,
        styles: {
          font: 'Meta',
          lineColor: [44, 62, 80],
          lineWidth: 0.55
                },
                headerStyles: {
                    fillColor: [186, 235, 236],  
                    lineColor: [44, 62, 80],
                    lineWidth: 0.55,
                    fontSize: 11
                },
                bodyStyles: {
                    fillColor: [242, 251, 251],  
                    lineColor: [44, 62, 80],
                    lineWidth: 0.55,
                    textColor: 50
                },
                alternateRowStyles: {
                    fillColor: [255, 255, 255], 
                    lineColor: [44, 62, 80],
                    lineWidth: 0.55,
                    textColor: 50
                },

        margin:{ top : 25},
        theme: 'plain',
        didDrawCell: (data:any) => {
            //console.log(data.column.index)
        }
        });

    
// PONER EL NUMERO DE LA PAGINA

const pageCount = pdf.getNumberOfPages();


pdf.setFont("courier", "normal");
pdf.setFontSize(12);
    
for(var i = 1; i <= pageCount; i++) {
     // Go to page i
    pdf.setPage(i);
     //Print Page 1 of 4 for example
    pdf.text('Pagina ' + String(i) + ' de ' + String(pageCount),250,15);
}

        pdf.save('table.pdf');

}


}
