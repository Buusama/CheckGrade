import { useState } from 'react';
import './index.css';
import axios from 'axios';

interface CourseInfo {
  staffName: string;
  grade: number;
  type: number;
}

function App() {
  const [mssv, setMssv] = useState('');
  const [kiHoc, setKiHoc] = useState('');
  const [courseInfo, setCourseInfo] = useState<CourseInfo[]>([]);

  const calculateMaxSemester = (startYear: number) => {

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() -1;
    const academicYearStartMonth = 9; // September
    const semesters = [];

    for (let year = startYear; year <= currentYear; year++) {
      for (let semester = 1; semester <= 3; semester++) {
        if (year === startYear && semester === 1) {
          if (currentDate.getMonth() + 1 < academicYearStartMonth) {
            // If current month is before the academic year start month, skip Kì 1 of the starting year
            continue;
          }
        }

        if (year === currentYear && semester === 3) {
          if (currentDate.getMonth() + 1 < academicYearStartMonth) {
            // If current month is before the academic year start month, skip Kì 3 of the current year
            continue;
          }
        }

        const semesterCode = `${year}${semester}`;
        semesters.push(semesterCode);
      }
    }

    return semesters;
  }
  const extractCourseInfo = (data: any): CourseInfo[] => {
    return data
      .filter((courseInfo: string) => courseInfo.startsWith(`{\"staffId`))
      .map((courseInfo: string) => {
        const courseInfoJson = JSON.parse(courseInfo);
        const staffName = courseInfoJson.staffName || '';
        const grade = courseInfoJson.grade || '';
        const type = courseInfoJson.type || '';

        if (staffName !== '' && grade !== '' && type !== '') {
          return { staffName, grade, type };
        }

        return null;
      })
      .filter(Boolean);
  };

  const handleSearch = async () => {
    const bodyData = `7|0|10|https://qldt.hust.edu.vn/soicteducationstudent/|0B50602DA554407940B4DC7885C62414|com.soict.edu.core.client.DataService|getCourseMembers|java.lang.Long/4227064769|java.lang.String/2004016611|java.util.List|${mssv}|java.util.Arrays$ArrayList/2507071751|${kiHoc}|1|2|3|4|3|5|6|7|5|THGFkwAAA|8|9|1|6|10|`;

    const headers = {
      accept: '*/*',
      'accept-language': 'vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5,ja;q=0.4',
      'content-type': 'text/x-gwt-rpc; charset=UTF-8',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'x-gwt-module-base': 'https://qldt.hust.edu.vn/soicteducationstudent/',
      'x-gwt-permutation': '136D87FF9D7295F6DE93F1903B794378',
    };

    const url = `https://qldt.hust.edu.vn/soicteducationstudent/data`;

    try {
      const response = await axios({
        url,
        method: 'POST',
        headers,
        data: bodyData,
      });

      const dataCourseMembers = response.data;
      const start = dataCourseMembers.indexOf('["java');
      const end = dataCourseMembers.lastIndexOf(']');
      const data = dataCourseMembers.substring(start, end - 4);
      const dataJson = JSON.parse(data);
      const courseInfoArray = extractCourseInfo(dataJson);

      setCourseInfo(courseInfoArray);
    } catch (error) {
      console.error('An error occurred while fetching data:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-white p-8 rounded max-w-md w-full mx-auto mt-8">
        <h2 className="text-2xl font-bold mb-6">Tìm kiếm điểm số QLDT</h2>
        <div className="mb-4">
          <label htmlFor="mssv" className="block text-sm font-medium text-gray-600">
            MSSV:
          </label>
          <input
            type="text"
            id="mssv"
            className="mt-1 p-2 w-full border rounded-md"
            onChange={(e) => setMssv(e.target.value)}
          />
        </div>
        <div className="mb-6">
          <label htmlFor="kiHoc" className="block text-sm font-medium text-gray-600">
            Kì học:
          </label>
          <select
            id="kiHoc"
            className="mt-1 p-2 w-full border rounded-md"
            onChange={(e) => setKiHoc(e.target.value)}
            value={kiHoc}
          >
            <option value="">Chọn kì học</option>
            {calculateMaxSemester(2022).map((semester) => (
              <option key={semester} value={semester}>
                {semester}
              </option>
            ))}
          </select>
        </div>
        <button
          className="bg-blue-500 text-white p-2 rounded-md w-full hover:bg-blue-600"
          onClick={handleSearch}
        >
          Tìm kiếm
        </button>
      </div>

      {courseInfo.length > 0 && (
        <div className="bg-white p-8 rounded max-w-md w-full mx-auto mt-8">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2">Staff Name</th>
                <th className="border border-gray-300 p-2">Grade</th>
                <th className="border border-gray-300 p-2">Type</th>
              </tr>
            </thead>
            <tbody>
              {courseInfo.map((info, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                  <td className="border border-gray-300 p-2">{info.staffName}</td>
                  <td className="border border-gray-300 p-2">{info.grade}</td>
                  <td className="border border-gray-300 p-2">{info.type === 1 ? 'Cuối kì' : 'Giữa kì'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;
