import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import readXlsxFile from 'read-excel-file';
import * as XLSX from 'xlsx';
import {Product} from './model/product';
import pdfMake from 'pdfmake/build/pdfmake';

import pdfFonts from 'pdfmake/build/vfs_fonts';
import {Resume,Experience,Education,Skill} from './model/resume';

pdfMake.vfs=pdfFonts.pdfMake.vfs;



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent  implements OnInit {
  resume=new Resume(); //PDF
  degrees=['B.E','M.E','B.Com','M.Com'];


  title = 'documentsproyect';
  products:Product[]; //EXCEL
  data:[][];//EXCELLL

  @ViewChild('#fileuploaded',{static: false}) 
  fileUploaded: ElementRef;


  constructor(elementRef:ElementRef){ 
    this.products=new Array();
    this.fileUploaded=elementRef;
    this.resume=JSON.parse(sessionStorage.getItem('resume')) || new Resume();
    if(!this.resume.experiences || this.resume.experiences.length==0){
      this.resume.experiences=[];
      this.resume.experiences.push(new Experience());
    }
    if (!this.resume.educations || this.resume.educations.length === 0) {
      this.resume.educations = [];
      this.resume.educations.push(new Education());
    }
    if (!this.resume.skills || this.resume.skills.length === 0) {
      this.resume.skills = [];
      this.resume.skills.push(new Skill());
    }
  }

  addExperience(){
    this.resume.experiences.push(new Experience());
  }

  addEducation() {
    this.resume.educations.push(new Education());
  }

  ngOnInit() {
    console.log(this.fileUploaded);
    this.fileUploaded.nativeElement.value = null;
  }

  generatePdf(action='open'){
    const documentDefinition=this.getDocumentDefinition();
//    pdfMake.createPdf(documentDefinition).open();
//    const documentDefinition={content:'This is an sample PDF printed with pdfMake'};
      switch(action){
        case 'open':pdfMake.createPdf(documentDefinition).open(); break;
        case 'print':pdfMake.createPdf(documentDefinition).print(); break;
        case 'download':pdfMake.createPdf(documentDefinition).download(); break;
        default: pdfMake.createPdf(documentDefinition).open();break;
      }
//    pdfMake.createPdf(documentDefinition).open();
  }
  resetForm(){
    this.resume=new Resume();
  }

  getDocumentDefinition(){
//    sessionStorage.setItem('resume',JSON.stringify(this.resume));

    return {
      content:[
        {
          text:'CURRICULUM',
          bold: true,
          fontSize:20,
          alignment:'center',
          margin:[0,0,0,20]
        },
        {
          columns:[
            [{
              text: this.resume.name,
              style: 'name'
            },
            {
              text: this.resume.address
            },
            {
              text: 'Email : ' + this.resume.email,
            },
            {
              text: 'Contant No : ' + this.resume.contactNo,
            },
            {
              text: 'GitHub: ' + this.resume.socialProfile,
              link: this.resume.socialProfile,
              color: 'blue',
            }
          ],
          [
            this.getProfilePicObject()
          ]
        ]
      },
      {
        text:'Skills',
        style:'header'
      },
      {
        columns: [
          {
            ul:[
              ...this.resume.skills.filter((value, index) => index % 3 === 0).map(s=>s.value)
            ]
          },
          {
            ul : [
              ...this.resume.skills.filter((value, index) => index % 3 === 1).map(s => s.value)
            ]
          },
          {
            ul : [
              ...this.resume.skills.filter((value, index) => index % 3 === 2).map(s => s.value)
            ]
          }          
        ]
      },
      {
        text:'Experience',
        style:'header'
      },
      this.getExperienceObject(this.resume.experiences),
      {
        text:'Other Details',
        style:'header'
      },
      this.getEducationObject(this.resume.educations),
      {
        text: 'Other Details',
        style: 'header'
      },
      {
        text:this.resume.otherDetails
      },
      {
        text:'Signature',
        style:'sign'
      },
/*      {
        colums:[
/*          [{ qr: this.resume.name + ', Contact No : ' + this.resume.contactNo, fit : 100 }],
          [{
          text: `(${this.resume.name})`,alignment: 'right'
          }],
        ]
      }*/
    ],
    info: {
      title:this.resume.name+'_RESUME',
      author:this.resume.name,
      subject:'RESUME',
      keywords:'RESUMEN, ONLINE RESUME',
    },
    styles:{
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 20, 0, 10],
          decoration: 'underline'
        },
        jobTitle: {
          fontSize: 14,
          bold: true,
          italics: true
        },
        name:{
          fontSize:16,
          bold:true
        },
        tableHeader: {
          bold: true,
        },
        sign: {
          margin: [0, 50, 0, 10],
          alignment: 'right',
          italics: true
        },
      }
    };
  }
  getExperienceObject(experiences: Experience[]) {
    const exs=[];
    experiences.forEach(experience=>{
      exs.push(
        [{
          columns:[
            [
              {
                text:experience.jobTitle,
                style:'jobTitle'
              },
              {
                text:experience.employer,
              },
              {
                text:experience.jobDescription,
              }
            ],
            {
              text:'Experience : '+experience.experience+ ' Months',
              alignment:'right'
            }
          ]

        }]
      );
    });
    return {
      table:{
        widths:['*'],
        body:[
          ...exs
        ]
      }
    }
  }

  getEducationObject(educations:Education[]){
    return{
      table:{
        widths:['*','*','*','*'],
        body:[
          [
            {
              text:'Degree',
              style:'tableHeader'
            },
            {
              text: 'College',
              style: 'tableHeader'
            },
            {
              text: 'Passing Year',
              style: 'tableHeader'
            },
            {
              text: 'Result',
              style: 'tableHeader'
            },            
          ],
          ...educations.map(ed=>{
            return [ed.degree,ed.college,ed.passingYear,ed.percentage];
          })
        ]
      }
    };
  }

  fileChanged(e){
    const file=e.target.files[0];
    this.getBase64(file);
  }

  getBase64(file) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      console.log("Reader result: ",reader.result);
      this.resume.profilePic = reader.result as string;
    };
    reader.onerror = (error) => {
      console.log('Error: ', error);
    };
  }

  getProfilePicObject(){
    if(this.resume.profilePic){
      return {
        image:this.resume.profilePic,
        width:75,
        alignment:'right'
      }
    }
    return null;
  }


  
  addSkill(){
    this.resume.skills.push(new Skill());
  }

/*  ngAfterViewInit() {
    var div = this.fileUploaded.nativeElement.querySelector('#fileuploaded');
    console.log(div);
  }*/

  onFileChange(evt:any){
    this.products=[]; 
    const target: DataTransfer= <DataTransfer>(evt.target);

    if(target.files.length!==1) throw new Error('Cannot use multiple files');

    const reader: FileReader=new FileReader();

    reader.onload= (e:any)=>{
      const bstr:string =e.target.result;

      const wb:XLSX.WorkBook = XLSX.read (bstr,{type:'binary'});

      const wsname:string=wb.SheetNames[0];

      const ws: XLSX.WorkSheet=wb.Sheets[wsname]; 
//      console.log(ws);

      this.data = (XLSX.utils.sheet_to_json(ws,{header:1}));
      console.log("Matrix",this.data);

      this.convertaMatrixToAnArray();
 

    };

    reader.readAsBinaryString(target.files[0]);
//    this.convertaMatrixToAnArray();
    return this.data;


  }

  convertaMatrixToAnArray(){
    var j=0;
    for(var i=1;i<this.data.length;i++){
      if(this.data[i][j]=='undefined' || !this.data[i][j]){
        break; 
      }
      else{
        try{
          if((isNaN(this.data[i][j]))){
            console.log("No corresponde el numero");
          }
          this.products.push({
              identity:Number(this.data[i][j]),
              name:this.data[i][++j],
              price:Number(this.data[i][++j]),
              sellerName:this.data[i][++j],
              counts:parseInt(this.data[i][++j]),
              status:this.data[i][++j]
            }); 
            j=0;    
          }
        catch(e){
          console.log("Error to cast ",e);
        }  
      }

    }    


 console.log("Array is ",this.products);

}

clearUploadedFile(){
  this.fileUploaded.nativeElement.value = null;
}




}

 /* 
  uploadExcel(e){
    try{

      const filename=e.target.files[0].name;

      import('xlsx').then(xlsx=>{
        let workBook=null;
        let jsonData=null;
        const reader=new FileReader();

        reader.onload = (event) =>{
          const data=reader.result;
          workBook= xlsx.read(data, {type:'binary'});
          jsonData=workBook.SheetNames.reduce((initial,name)=>{
            const sheet=workBook.Sheets[name];
            initial[name]=xlsx.utils.sheet_to_json(sheet);
            return initial;
          },{});
          this.products=jsonData[Object.keys(jsonData)[0]];
          console.log('Products', this.products)


        };  
        reader.readAsBinaryString(e.target.files[0]);
      });
    }catch(e){

      console.log('error',e);

    }

  
  }*/
  



